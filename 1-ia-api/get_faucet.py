import asyncio
from cdp import CdpClient

API_KEY_ID = "3c6fa85f-b858-4bab-9280-dee01edf8a21"
API_KEY_SECRET = "cn/3XlaJpWG+SDfoJ/CqJNfUvsxzJ82N444YRyXj+Q1x6TAzfYNGRUmzj0b3NNs1B5lrmWdnDi1FasOCdll43A=="

async def main():
    cdp = CdpClient(api_key_id=API_KEY_ID, api_key_secret=API_KEY_SECRET)
    
    # On demande les ETH sur Base Sepolia pour ton adresse
    tx_hash = await cdp.evm.request_faucet(
        address="0xF4872C109B121D1Ccce726c31eA1a213b2D61B09",
        network="base-sepolia",
        token="eth"
    )
    print(f"✅ Succès ! Hash de la transaction : {tx_hash}")
    print(f"Vérifie sur : https://sepolia.basescan.org/tx/{tx_hash}")

asyncio.run(main())