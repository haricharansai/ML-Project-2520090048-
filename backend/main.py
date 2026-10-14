"""
FastAPI Backend for Fake News Detection.

Provides REST API endpoints for text classification predictions.
"""

import json
import sys
from pathlib import Path
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "ml"))
from predict import Predictor

app = FastAPI(title="Fake News Detection API", version="1.0.0")


class PredictionRequest(BaseModel):
    text: str
    model_type: str = "bert"


class HealthResponse(BaseModel):
    status: str
    models: dict


class ModelInfo(BaseModel):
    available: bool
    loaded: bool
    status: str
    error: Optional[str] = None


class DashboardResponse(BaseModel):
    dataset: Optional[dict]
    models: dict
    metrics: Optional[dict]
    history: Optional[dict] = None


_predictor_cache: dict[str, Predictor] = {}
_model_status: dict[str, ModelInfo] = {
    "bert": ModelInfo(available=False, loaded=False, status="not_trained"),
    "lstm": ModelInfo(available=False, loaded=False, status="not_trained"),
}


def _resolve_model_path(model_type: str) -> Path:
    if model_type == "bert":
        return PROJECT_ROOT / "models" / "bert"
    if model_type == "lstm":
        return PROJECT_ROOT / "models" / "lstm"
    raise ValueError(f"Unknown model type: {model_type}")


def _load_predictor(model_type: str) -> Predictor:
    if model_type in _predictor_cache:
        return _predictor_cache[model_type]
    model_path = _resolve_model_path(model_type)
    predictor = Predictor(str(model_path), model_type=model_type)
    _predictor_cache[model_type] = predictor
    return predictor


def _check_model_availability(model_type: str):
    model_dir = _resolve_model_path(model_type)
    if model_type == "bert":
        missing = []
        if not (model_dir / "config.json").exists():
            missing.append("config.json")
        if not (model_dir / "tokenizer.json").exists() and not (model_dir / "vocab.txt").exists():
            missing.append("tokenizer.json or vocab.txt")
        if not (model_dir / "pytorch_model.bin").exists() and not (model_dir / "model.safetensors").exists():
            missing.append("pytorch_model.bin or model.safetensors")
        if missing:
            _model_status[model_type] = ModelInfo(
                available=False, loaded=False, status="not_trained",
                error=f"Missing files: {', '.join(missing)}"
            )
            return False
    elif model_type == "lstm":
        required = ["model.pt", "vocab.json", "config.json"]
        missing = [f for f in required if not (model_dir / f).exists()]
        if missing:
            _model_status[model_type] = ModelInfo(
                available=False, loaded=False, status="not_trained",
                error=f"Missing files: {', '.join(missing)}"
            )
            return False
    _model_status[model_type] = ModelInfo(available=True, loaded=False, status="available")
    return True


@app.on_event("startup")
async def load_models():
    for mt in ("bert", "lstm"):
        try:
            if _check_model_availability(mt):
                _load_predictor(mt)
                _model_status[mt] = ModelInfo(available=True, loaded=True, status="loaded")
        except Exception as e:
            _model_status[mt] = ModelInfo(
                available=True, loaded=False, status="error", error=str(e)
            )


@app.get("/api/health", response_model=HealthResponse)
async def health():
    models = {}
    for mt, info in _model_status.items():
        models[mt] = {
            "available": info.available,
            "loaded": info.loaded,
            "status": info.status,
        }
        if info.error:
            models[mt]["error"] = info.error
    return HealthResponse(status="ok" if any(m["loaded"] for m in models.values()) else "degraded", models=models)


@app.get("/api/dashboard", response_model=DashboardResponse)
async def dashboard():
    manifest_path = PROJECT_ROOT / "data" / "processed" / "manifest.json"
    dataset = None
    if manifest_path.exists():
        try:
            with open(manifest_path) as f:
                dataset = json.load(f)
        except Exception:
            pass

    metrics = None
    lstm_metrics_path = PROJECT_ROOT / "models" / "lstm" / "metrics.json"
    bert_metrics_path = PROJECT_ROOT / "models" / "bert" / "metrics.json"
    if lstm_metrics_path.exists():
        try:
            with open(lstm_metrics_path) as f:
                metrics = {"lstm": json.load(f)}
        except Exception:
            pass
    if bert_metrics_path.exists():
        try:
            with open(bert_metrics_path) as f:
                if metrics is None:
                    metrics = {}
                metrics["bert"] = json.load(f)
        except Exception:
            pass

    history = None
    lstm_history_path = PROJECT_ROOT / "models" / "lstm" / "history.json"
    bert_history_path = PROJECT_ROOT / "models" / "bert" / "history.json"
    if lstm_history_path.exists():
        try:
            with open(lstm_history_path) as f:
                history = {"lstm": json.load(f)}
        except Exception:
            pass
    if bert_history_path.exists():
        try:
            with open(bert_history_path) as f:
                if history is None:
                    history = {}
                history["bert"] = json.load(f)
        except Exception:
            pass

    models = {}
    for mt, info in _model_status.items():
        models[mt] = {
            "available": info.available,
            "loaded": info.loaded,
            "status": info.status,
        }
        if info.error:
            models[mt]["error"] = info.error

    return DashboardResponse(dataset=dataset, models=models, metrics=metrics, history=history)


@app.post("/api/predict")
async def predict(request: PredictionRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if request.model_type not in ("bert", "lstm", "both"):
        raise HTTPException(status_code=400, detail="model_type must be 'bert', 'lstm', or 'both'")

    model_types = ["bert", "lstm"] if request.model_type == "both" else [request.model_type]
    predictions = []

    for mt in model_types:
        if not _check_model_availability(mt):
            raise HTTPException(status_code=503, detail=f"Model '{mt}' is not trained yet")
        try:
            predictor = _load_predictor(mt)
            result = predictor.predict(request.text)
            predictions.append({
                "model": mt,
                "label": result.get("label", "unknown"),
                "confidence": result.get("confidence", 0.0),
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction failed for {mt}: {str(e)}")

    agreement = len(set(p["label"] for p in predictions)) == 1 if predictions else False
    return {"predictions": predictions, "agreement": agreement}


@app.post("/api/predict/batch")
async def predict_batch(request: PredictionRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if request.model_type not in ("bert", "lstm", "both"):
        raise HTTPException(status_code=400, detail="model_type must be 'bert', 'lstm', or 'both'")

    texts = [request.text]
    model_types = ["bert", "lstm"] if request.model_type == "both" else [request.model_type]
    results = []

    for text in texts:
        for mt in model_types:
            if not _check_model_availability(mt):
                raise HTTPException(status_code=503, detail=f"Model '{mt}' is not trained yet")
            try:
                predictor = _load_predictor(mt)
                result = predictor.predict(text)
                results.append({
                    "model": mt,
                    "label": result.get("label", "unknown"),
                    "confidence": result.get("confidence", 0.0),
                })
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Prediction failed for {mt}: {str(e)}")

    agreement = len(set(r["label"] for r in results)) == 1 if results else False
    return {"predictions": results, "agreement": agreement}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)