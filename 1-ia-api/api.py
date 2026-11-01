from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import shap

app = FastAPI()

# --- CORRECTION CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Autorise toutes les origines (Vercel, localhost, etc.)
    allow_credentials=False,   # ⚠️ DOIT ÊTRE FALSE quand on utilise "*"
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------

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