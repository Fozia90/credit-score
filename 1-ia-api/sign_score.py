from eth_account import Account
from eth_account.messages import encode_defunct
import json

# ATTENTION : Pour le vrai projet, génère une clé privée forte et garde-la secrète
private_key = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
account = Account.from_key(private_key)

# Le message à signer (le score)
score_data = {
    "user": "0x123...", # Adresse du client
    "score": 85,
    "nonce": 1
}
message = json.dumps(score_data)

# Signature
encoded_msg = encode_defunct(text=message)
signed_message = account.sign_message(encoded_msg)

print(f"Adresse du signataire : {account.address}")
print(f"Signature : {signed_message.signature.hex()}")