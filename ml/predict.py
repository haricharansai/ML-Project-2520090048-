"""
Prediction module for Fake News Detection.

Load a trained model and run inference on new text inputs.
"""

import json
import torch
from pathlib import Path


class Predictor:
    """Wrapper for running predictions with trained models."""

    def __init__(self, model_path: str, model_type: str = "bert"):
        self.model_type = model_type
        self.model_path = Path(model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.tokenizer = None
        self.vocab = None
        self.config = {}
        self.label_map = {"0": "real", "1": "fake"}
        self.max_length = 256
        self._load_model()

    def _load_model(self):
        """Load the trained model from disk."""
        if self.model_type == "bert":
            from transformers import BertTokenizer, BertForSequenceClassification
            self.tokenizer = BertTokenizer.from_pretrained(self.model_path)
            self.model = BertForSequenceClassification.from_pretrained(self.model_path)
            config_path = self.model_path / "config.json"
            if config_path.exists():
                with open(config_path) as f:
                    self.config = json.load(f)
            self.max_length = self.config.get("max_length", 256)
        elif self.model_type == "lstm":
            self._load_lstm()
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
        self.model.to(self.device)
        self.model.eval()

    def _load_lstm(self):
        """Load LSTM model, vocab, and config from disk."""
        import torch.nn as nn
        from train_lstm import BiLSTMClassifier

        vocab_path = self.model_path / "vocab.json"
        config_path = self.model_path / "config.json"
        model_path = self.model_path / "model.pt"

        if vocab_path.exists():
            with open(vocab_path) as f:
                self.vocab = json.load(f)
        if config_path.exists():
            with open(config_path) as f:
                self.config = json.load(f)

        label_map_path = self.model_path / "label_map.json"
        if label_map_path.exists():
            with open(label_map_path) as f:
                self.label_map = json.load(f)

        embed_dim = self.config.get("embed_dim", 128)
        hidden_dim = self.config.get("hidden_dim", 256)
        num_layers = self.config.get("num_layers", 2)
        dropout = self.config.get("dropout", 0.3)
        vocab_size = len(self.vocab) if self.vocab else 2

        self.model = BiLSTMClassifier(
            vocab_size=vocab_size,
            embed_dim=embed_dim,
            hidden_dim=hidden_dim,
            num_classes=2,
            dropout=dropout,
        )
        state_dict = torch.load(str(model_path), map_location=self.device)
        if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
            state_dict = state_dict["model_state_dict"]
        self.model.load_state_dict(state_dict)
        self.max_length = self.config.get("max_length", 256)

    def predict(self, text: str) -> dict:
        """Predict whether a single text is fake or real news."""
        if self.model_type == "bert":
            return self._predict_bert(text)
        elif self.model_type == "lstm":
            return self._predict_lstm(text)
        raise ValueError(f"Unknown model type: {self.model_type}")

    def _predict_bert(self, text: str) -> dict:
        """Run BERT inference on a single text."""
        try:
            from preprocessing import clean_news_text
            cleaned_text = clean_news_text(text)
        except Exception:
            cleaned_text = text.strip()

        encoding = self.tokenizer(
            cleaned_text,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)

        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            probs = torch.softmax(outputs.logits, dim=1)

        label = probs.argmax(dim=1).item()
        confidence = probs[0][label].item()
        label_str = self.label_map.get(str(label), "fake" if label == 1 else "real")
        return {
            "label": label_str,
            "confidence": round(confidence, 4),
        }

    def _predict_lstm(self, text: str) -> dict:
        """Run LSTM inference on a single text."""
        try:
            from preprocessing import clean_news_text
            cleaned_text = clean_news_text(text)
        except Exception:
            cleaned_text = text.strip()

        try:
            from train_lstm import tokenize_text
            tokens = tokenize_text(cleaned_text)[: self.max_length]
        except Exception:
            tokens = cleaned_text.lower().split()[: self.max_length]

        if self.vocab is None:
            raise RuntimeError("LSTM vocabulary not loaded")

        indices = [self.vocab.get(t, self.vocab.get("<UNK>", 1)) for t in tokens]
        pad_length = self.max_length - len(indices)
        if pad_length > 0:
            indices += [0] * pad_length

        input_tensor = torch.tensor([indices], dtype=torch.long).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.softmax(outputs, dim=1)

        label = probs.argmax(dim=1).item()
        confidence = probs[0][label].item()
        label_str = self.label_map.get(str(label), "fake" if label == 1 else "real")
        return {
            "label": label_str,
            "confidence": round(confidence, 4),
        }


if __name__ == "__main__":
    print("Prediction module ready. Use Predictor class for inference.")