import pandas as pd
import numpy as np
from xgboost import XGBClassifier
import shap
import pickle

# 1. Création de données synthétiques (Mobile Money)
np.random.seed(42)
n = 1000
data = {
    'regularite_depots': np.random.uniform(0, 1, n), # 0 à 1
    'montant_moyen': np.random.uniform(100, 10000, n),
    'remboursements_a_temps': np.random.uniform(0, 1, n)
}
df = pd.DataFrame(data)

# On crée une "vérité" : si régularité > 0.7 et remboursement > 0.7, c'est bon (1), sinon 0
df['solvable'] = ((df['regularite_depots'] > 0.7) & (df['remboursements_a_temps'] > 0.7)).astype(int)

X = df.drop('solvable', axis=1)
y = df['solvable']

# 2. Entraînement du modèle
model = XGBClassifier()
model.fit(X, y)

# 3. Sauvegarde du modèle
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Modèle entraîné et sauvegardé !")