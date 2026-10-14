"""
BERT Fine-tuning for Fake News Detection.

Fine-tune a pre-trained BERT model on the news classification task.
"""

import argparse
import json
import random
import sys
import time
import torch
import torch.nn as nn
from pathlib import Path
from torch.utils.data import Dataset, DataLoader

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification, get_linear_schedule_with_warmup


class NewsDataset(Dataset):
    """PyTorch Dataset for BERT-based news classification."""

    def __init__(self, texts, labels, tokenizer, max_len=256):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long),
        }


def train_epoch(model, loader, optimizer, scheduler, criterion, device):
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    for i, batch in enumerate(loader):
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)

        optimizer.zero_grad()
        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        logits = outputs.logits
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()

        total_loss += loss.item()
        correct += (logits.argmax(1) == labels).sum().item()
        total += labels.size(0)
        if (i + 1) % 25 == 0 or (i + 1) == len(loader):
            print(f"Batch {i+1}/{len(loader)} — Loss: {total_loss / (i+1):.4f}, Acc: {correct / total:.4f}", flush=True)
    return total_loss / len(loader), correct / total


def evaluate(model, loader, device):
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    with torch.no_grad():
        for batch in loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            total_loss += outputs.loss.item()
            correct += (outputs.logits.argmax(1) == labels).sum().item()
            total += labels.size(0)
    return total_loss / len(loader), correct / total


def set_seed(seed: int = 42):
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def main():
    parser = argparse.ArgumentParser(description="Fine-tune BERT for fake news detection")
    parser.add_argument("--data-dir", type=str, default=str(PROJECT_ROOT / "data" / "processed"), help="Path to processed data")
    parser.add_argument("--model-id", type=str, default="bert-base-uncased", help="Pretrained model ID")
    parser.add_argument("--output-dir", type=str, default=str(PROJECT_ROOT / "models" / "bert"), help="Output directory")
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--weight-decay", type=float, default=0.01)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--max-length", type=int, default=256)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--patience", type=int, default=2, help="Early stopping patience")
    parser.add_argument("--gradient-clip", type=float, default=1.0)
    parser.add_argument("--freeze-base", action="store_true", help="Freeze lower BERT layers for faster training on CPU")
    parser.add_argument("--max-samples", type=int, default=None, help="Limit number of training samples for quick fine-tuning")
    args = parser.parse_args()

    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_df = pd.read_csv(Path(args.data_dir) / "train.csv")
    val_df = pd.read_csv(Path(args.data_dir) / "validation.csv")
    test_df = pd.read_csv(Path(args.data_dir) / "test.csv")

    if args.max_samples and len(train_df) > args.max_samples:
        train_df = train_df.sample(n=args.max_samples, random_state=args.seed).reset_index(drop=True)

    text_col = "text" if "text" in train_df.columns else train_df.columns[0]
    label_col = "label" if "label" in train_df.columns else train_df.columns[1]

    tokenizer = BertTokenizer.from_pretrained(args.model_id)

    train_dataset = NewsDataset(train_df[text_col].tolist(), train_df[label_col].tolist(), tokenizer, args.max_length)
    val_dataset = NewsDataset(val_df[text_col].tolist(), val_df[label_col].tolist(), tokenizer, args.max_length)
    test_dataset = NewsDataset(test_df[text_col].tolist(), test_df[label_col].tolist(), tokenizer, args.max_length)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False)

    model = BertForSequenceClassification.from_pretrained(
        args.model_id,
        num_labels=2,
        id2label={0: "real", 1: "fake"},
        label2id={"real": 0, "fake": 1},
    ).to(device)

    if args.freeze_base and hasattr(model, "bert"):
        for param in model.bert.embeddings.parameters():
            param.requires_grad = False
        for layer in model.bert.encoder.layer[:-2]:
            for param in layer.parameters():
                param.requires_grad = False

    trainable_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(trainable_params, lr=args.lr, weight_decay=args.weight_decay)

    num_steps = len(train_loader) * args.epochs
    num_warmup = int(num_steps * args.warmup_ratio)
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=num_warmup,
        num_training_steps=num_steps,
    )
    criterion = nn.CrossEntropyLoss()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    best_val_f1 = 0.0
    patience_counter = 0
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

    for epoch in range(args.epochs):
        start = time.time()
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, scheduler, criterion, device)
        val_loss, val_acc = evaluate(model, val_loader, device)
        epoch_time = time.time() - start

        history["train_loss"].append(round(train_loss, 4))
        history["val_loss"].append(round(val_loss, 4))
        history["train_acc"].append(round(train_acc, 4))
        history["val_acc"].append(round(val_acc, 4))

        print(f"Epoch {epoch+1}/{args.epochs} ({epoch_time:.1f}s) — Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}, Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")

        if val_acc > best_val_f1:
            best_val_f1 = val_acc
            patience_counter = 0
            model.save_pretrained(output_dir)
            tokenizer.save_pretrained(output_dir)
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                print(f"Early stopping at epoch {epoch+1}")
                break

    with open(output_dir / "history.json", "w") as f:
        json.dump(history, f, indent=2)

    config = {
        "model_id": args.model_id,
        "max_length": args.max_length,
        "batch_size": args.batch_size,
        "lr": args.lr,
        "weight_decay": args.weight_decay,
        "warmup_ratio": args.warmup_ratio,
        "epochs": args.epochs,
        "seed": args.seed,
    }
    with open(output_dir / "training_config.json", "w") as f:
        json.dump(config, f, indent=2)

    model.eval()
    test_loss, test_acc = evaluate(model, test_loader, device)
    print(f"Test Loss: {test_loss:.4f}, Test Acc: {test_acc:.4f}")

    test_metrics = {
        "test_loss": round(test_loss, 4),
        "test_accuracy": round(test_acc, 4),
        "model_id": args.model_id,
    }
    with open(output_dir / "metrics.json", "w") as f:
        json.dump(test_metrics, f, indent=2)

    print(f"Model saved to {output_dir}")


if __name__ == "__main__":
    main()