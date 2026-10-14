"""
LSTM Model Training for Fake News Detection.

Train a BiLSTM classifier on the preprocessed text data.
"""

import argparse
import json
import random
import sys
import torch
import torch.nn as nn
from pathlib import Path
from torch.utils.data import Dataset, DataLoader

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
import pandas as pd


def tokenize_text(text: str) -> list[str]:
    """Extract lowercased alphanumeric tokens from text."""
    import re
    if not isinstance(text, str):
        return []
    return re.findall(r"\b[a-zA-Z0-9'-]+\b", text.lower())


class NewsDataset(Dataset):
    """PyTorch Dataset for news text classification."""

    def __init__(self, texts, labels, vocab, max_len=256):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx]) if self.texts[idx] is not None else ""
        tokens = tokenize_text(text)[:self.max_len]
        indices = [self.vocab.get(t, self.vocab.get("<UNK>", 1)) for t in tokens]
        indices += [0] * (self.max_len - len(indices))
        return torch.tensor(indices, dtype=torch.long), torch.tensor(self.labels[idx], dtype=torch.long)


class BiLSTMClassifier(nn.Module):
    """Bidirectional LSTM for text classification."""

    def __init__(self, vocab_size, embed_dim=128, hidden_dim=256, num_classes=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=2, bidirectional=True, dropout=dropout, batch_first=True)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        embeds = self.dropout(self.embedding(x))
        lstm_out, (hidden, _) = self.lstm(embeds)
        hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        out = self.fc(self.dropout(hidden))
        return out


def build_vocab(texts, min_freq=2):
    """Build vocabulary from list of texts."""
    from collections import Counter
    counter = Counter()
    for text in texts:
        counter.update(tokenize_text(str(text)))
    vocab = {"<PAD>": 0, "<UNK>": 1}
    for word, freq in counter.items():
        if freq >= min_freq:
            vocab[word] = len(vocab)
    return vocab


def train_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    for inputs, labels in loader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        correct += (outputs.argmax(1) == labels).sum().item()
        total += labels.size(0)
    return total_loss / len(loader), correct / total


def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            total_loss += loss.item()
            correct += (outputs.argmax(1) == labels).sum().item()
            total += labels.size(0)
    return total_loss / len(loader), correct / total


def set_seed(seed: int = 42):
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def main():
    parser = argparse.ArgumentParser(description="Train BiLSTM for fake news detection")
    parser.add_argument("--data-dir", type=str, default=str(PROJECT_ROOT / "data" / "processed"), help="Path to processed data")
    parser.add_argument("--output-dir", type=str, default=str(PROJECT_ROOT / "models" / "lstm"), help="Output directory")
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--max-length", type=int, default=256)
    parser.add_argument("--embed-dim", type=int, default=128)
    parser.add_argument("--hidden-dim", type=int, default=256)
    parser.add_argument("--num-layers", type=int, default=2)
    parser.add_argument("--dropout", type=float, default=0.3)
    parser.add_argument("--min-freq", type=int, default=2)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--patience", type=int, default=3, help="Early stopping patience")
    args = parser.parse_args()

    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_df = pd.read_csv(Path(args.data_dir) / "train.csv")
    val_df = pd.read_csv(Path(args.data_dir) / "validation.csv")
    test_df = pd.read_csv(Path(args.data_dir) / "test.csv")

    vocab = build_vocab(train_df["text"].tolist() if "text" in train_df.columns else train_df.iloc[:, 0].tolist(), min_freq=args.min_freq)

    text_col = "text" if "text" in train_df.columns else train_df.columns[0]
    label_col = "label" if "label" in train_df.columns else train_df.columns[1]

    train_dataset = NewsDataset(train_df[text_col].tolist(), train_df[label_col].tolist(), vocab, args.max_length)
    val_dataset = NewsDataset(val_df[text_col].tolist(), val_df[label_col].tolist(), vocab, args.max_length)
    test_dataset = NewsDataset(test_df[text_col].tolist(), test_df[label_col].tolist(), vocab, args.max_length)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False)

    model = BiLSTMClassifier(
        vocab_size=len(vocab),
        embed_dim=args.embed_dim,
        hidden_dim=args.hidden_dim,
        num_classes=2,
        dropout=args.dropout,
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    criterion = nn.CrossEntropyLoss()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    best_val_f1 = 0.0
    patience_counter = 0
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

    for epoch in range(args.epochs):
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, criterion, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)

        history["train_loss"].append(round(train_loss, 4))
        history["val_loss"].append(round(val_loss, 4))
        history["train_acc"].append(round(train_acc, 4))
        history["val_acc"].append(round(val_acc, 4))

        print(f"Epoch {epoch+1}/{args.epochs} — Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}, Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")

        if val_acc > best_val_f1:
            best_val_f1 = val_acc
            patience_counter = 0
            torch.save(model.state_dict(), output_dir / "model.pt")
            config = {
                "embed_dim": args.embed_dim,
                "hidden_dim": args.hidden_dim,
                "num_layers": args.num_layers,
                "dropout": args.dropout,
                "max_length": args.max_length,
                "vocab_size": len(vocab),
            }
            with open(output_dir / "config.json", "w") as f:
                json.dump(config, f, indent=2)
            with open(output_dir / "vocab.json", "w") as f:
                json.dump(vocab, f, indent=2)
            label_map = {"0": "real", "1": "fake"}
            with open(output_dir / "label_map.json", "w") as f:
                json.dump(label_map, f, indent=2)
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                print(f"Early stopping at epoch {epoch+1}")
                break

    with open(output_dir / "history.json", "w") as f:
        json.dump(history, f, indent=2)

    model.load_state_dict(torch.load(output_dir / "model.pt", map_location=device))
    test_loss, test_acc = evaluate(model, test_loader, criterion, device)
    print(f"Test Loss: {test_loss:.4f}, Test Acc: {test_acc:.4f}")

    test_metrics = {
        "test_loss": round(test_loss, 4),
        "test_accuracy": round(test_acc, 4),
    }
    with open(output_dir / "metrics.json", "w") as f:
        json.dump(test_metrics, f, indent=2)

    print(f"Model saved to {output_dir}")


if __name__ == "__main__":
    main()