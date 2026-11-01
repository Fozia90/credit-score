from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- NOUVEAU
from pydantic import BaseModel
import pickle
import numpy as np
import shap

app = FastAPI()

# --- NOUVEAU : Configuration CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # L'adresse de ton Vite
    allow_credentials=True,
    allow_methods=["*"], # Autorise toutes les méthodes (GET, POST, OPTIONS...)
    allow_headers=["*"],
)
# ------------------------------------

# Charger le modèle
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

class InputData(BaseModel):
    regularite_depots: float
    montant_moyen: float
    remboursements_a_temps: float

@app.post("/predict")
def predict(data: InputData):
    # Préparer les données
    features = np.array([[data.regularite_depots, data.montant_moyen, data.remboursements_a_temps]])
    
    # Prédiction (Probabilité d'être solvable)
    proba = model.predict_proba(features)[0][1]
    score = int(proba * 100)
    
    # Explication SHAP
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(features)
    
    # On renvoie le score et l'explication simple
    return {
        "score": score,
        "explication": "Le score est basé sur la régularité des dépôts et le montant.",
        "shap_values": shap_values[0].tolist()
    }