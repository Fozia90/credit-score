import { useState } from "react";
import "./App.css";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import { BrowserProvider, Contract, parseEther } from "ethers";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [account, setAccount] = useState("");
  const [networkName, setNetworkName] = useState("Non détecté");
  const [amount, setAmount] = useState("");
  const [score, setScore] = useState(null);
  const [contractRate, setContractRate] = useState(null);
  const [duration, setDuration] = useState("30");
  const [request, setRequest] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Gestion de l'historique local
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("creditHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  const totalRequests = history.length;
  const totalAmount = history.reduce((total, item) => total + Number(item.amount), 0);
  const pendingRequests = history.filter((item) => item.status === "En attente d'analyse").length;

  // --- 1. CONNEXION WALLET ---
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Veuillez installer MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId === 84532n) {
        setNetworkName("Base Sepolia");
      } else {
        setNetworkName(network.name);
      }
    } catch (error) {
      alert("Connexion au portefeuille annulée.");
    }
  }

  function copyAddress() {
    if (!account) {
      alert("Veuillez d'abord connecter MetaMask.");
      return;
    }
    navigator.clipboard.writeText(account)
      .then(() => alert("Adresse copiée avec succès !"))
      .catch(() => alert("Impossible de copier l'adresse."));
  }

  // --- 2. ANALYSE VIA L'IA (API PYTHON) ---
  async function simulateScore() {
    if (!amount || Number(amount) <= 0) {
      alert("Veuillez saisir un montant valide.");
      return;
    }

    setIsAnalyzing(true);
    setTxHash(null);

    try {
      // Appel à ton API Python FastAPI
      const response = await fetch("https://credit-score-api-0jdu.onrender.com/predict", { ... })
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regularite_depots: 0.8, // Valeurs simulées pour le test
          montant_moyen: 5000,
          remboursements_a_temps: 0.9
        })
      });

      if (!response.ok) throw new Error("Erreur réseau");

      const data = await response.json();
      const aiScore = data.score; 
      
      setScore(aiScore);
      setContractRate(calculateRate(aiScore));
      
      const newRequest = {
        amount: amount,
        duration: duration,
        status: aiScore > 70 ? "Approuvé (En attente Blockchain)" : "Refusé (Score faible)",
        score: aiScore,
        date: new Date().toLocaleDateString("fr-FR"),
      };
      
      setRequest(newRequest);
      setHistory((prev) => [newRequest, ...prev]);
      localStorage.setItem("creditHistory", JSON.stringify([newRequest, ...history]));

    } catch (error) {
      console.error(error);
      alert("Impossible de contacter l'API IA. Le serveur Python est-il lancé ?");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // --- 3. ENREGISTREMENT SUR LA BLOCKCHAIN ---
  async function enregistrerPretBlockchain() {
    if (!window.ethereum || !account) {
      alert("Veuillez connecter MetaMask.");
      return;
    }
    if (score === null || score <= 70) {
      alert("Le score est insuffisant pour enregistrer un prêt sur la blockchain.");
      return;
    }

    setIsSaving(true);
    setTxHash(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 84532n) {
        alert("Veuillez sélectionner le réseau Base Sepolia dans MetaMask.");
        setIsSaving(false);
        return;
      }

      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Conversion du montant en Wei
      const montantWei = parseEther(amount); 
      
      // Appel de la fonction du contrat
      const tx = await contract.creerPret(account, montantWei, score);
      
      await tx.wait(); // Attendre la validation
      
      setTxHash(tx.hash);
      alert("✅ Prêt enregistré avec succès sur la blockchain !");

    } catch (error) {
      console.error(error);
      alert("Erreur blockchain : " + (error.reason || error.message));
    } finally {
      setIsSaving(false);
    }
  }

  // Calcule un faux taux d'intérêt basé sur le score
  function calculateRate(value) {
    if (value >= 80) return 5;
    if (value >= 60) return 10;
    if (value >= 40) return 15;
    return 20;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">C</div>
          <div>
            <h2>CreditScore</h2>
            <p>Decentralized Lending</p>
          </div>
        </div>

        <nav className="navigation">
          <button className={activePage === "dashboard" ? "active" : ""} onClick={() => setActivePage("dashboard")}>Tableau de bord</button>
          <button className={activePage === "loan" ? "active" : ""} onClick={() => setActivePage("loan")}>Demander un prêt</button>
          <button className={activePage === "history" ? "active" : ""} onClick={() => setActivePage("history")}>Historique</button>
          <button className={activePage === "profile" ? "active" : ""} onClick={() => setActivePage("profile")}>Mon profil</button>
        </nav>

        <button className="wallet-button" onClick={connectWallet}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connecter MetaMask"}
        </button>
      </header>

      <main className="main">
        {activePage === "dashboard" && (
          <section className="hero">
            <span className="badge">ESPACE EMPRUNTEUR</span>
            <h1>Bienvenue sur<br /><span>CreditScore.</span></h1>
            <p>Gérez vos demandes de prêt et consultez vos informations de crédit en toute simplicité.</p>
            <button className="primary-button" onClick={() => setActivePage("loan")}>Demander un prêt</button>

            <div className="dashboard-stats">
              <div className="stat-card"><p>Total des demandes</p><h2>{totalRequests}</h2></div>
              <div className="stat-card"><p>Montant total demandé</p><h2>{totalAmount} ETH</h2></div>
              <div className="stat-card"><p>Demandes en attente</p><h2>{pendingRequests}</h2></div>
            </div>
          </section>
        )}

        {activePage === "loan" && (
          <section className="loan-card">
            <div className="card-heading">
              <div>
                <h2>Demander un prêt</h2>
                <p>Préparez votre demande de crédit.</p>
              </div>
              <span className="card-icon">↗</span>
            </div>

            <label>Montant souhaité (ETH)</label>
            <div className="input-wrapper">
              <input type="number" min="0.01" step="0.01" placeholder="Ex. 1" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <span>ETH</span>
            </div>

            <label>Durée du prêt</label>
            <select className="loan-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="30">30 jours</option>
              <option value="60">60 jours</option>
              <option value="90">90 jours</option>
            </select>

            <button className="primary-button" onClick={simulateScore} disabled={isAnalyzing}>
              {isAnalyzing ? "Analyse de l'IA en cours..." : "Analyser ma demande avec l'IA"}
            </button>

            {request !== null && (
              <div className="result">
                <h3>Récapitulatif</h3>
                <p>Montant : {request.amount} ETH</p>
                <p>Durée : {request.duration} jours</p>
                <p>Score IA : <strong>{score}/100</strong></p>
                {contractRate && <p>Taux simulé : {contractRate}%</p>}
                
                {score > 70 ? (
                  <>
                    <p style={{color: "green"}}>✅ Éligible au prêt</p>
                    <button className="primary-button" style={{marginTop: "10px", backgroundColor: "#28a745"}} onClick={enregistrerPretBlockchain} disabled={isSaving}>
                      {isSaving ? "Transaction en cours..." : "Enregistrer sur la Blockchain"}
                    </button>
                  </>
                ) : (
                  <p style={{color: "red"}}>❌ Score insuffisant (minimum 70)</p>
                )}

                {txHash && (
                  <div style={{marginTop: "15px", padding: "10px", border: "1px solid green", borderRadius: "5px"}}>
                    <p>✅ Prêt enregistré sur Base Sepolia !</p>
                    <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer">Voir sur BaseScan</a>
                  </div>
                )}
              </div>
            )}
            <p className="notice">Les conditions seront déterminées après l'analyse de votre profil.</p>
          </section>
        )}

        {activePage === "history" && (
          <section className="loan-card">
            <div className="card-heading">
              <div>
                <h2>Historique des demandes</h2>
                <p>Retrouvez toutes vos demandes de prêt.</p>
              </div>
              <span className="card-icon">📋</span>
            </div>

            {history.length === 0 ? (
              <div className="result">
                <h3>Aucune demande pour le moment</h3>
                <p>Vos demandes de prêt apparaîtront ici après leur soumission.</p>
                <button className="primary-button" onClick={() => setActivePage("loan")}>Faire une demande</button>
              </div>
            ) : (
              <div>
                {history.map((item, index) => (
                  <div className="result" key={index}>
                    <h3>Demande #{index + 1}</h3>
                    <p>Montant : {item.amount} ETH</p>
                    <p>Durée : {item.duration} jours</p>
                    <p>Score IA : {item.score}/100</p>
                    <p>Statut : {item.status}</p>
                    <p>Date : {item.date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activePage === "profile" && (
          <section className="loan-card">
            <div className="card-heading">
              <div>
                <h2>Mon profil</h2>
                <p>Informations de votre portefeuille.</p>
              </div>
              <span className="card-icon">👤</span>
            </div>

            <div className="result">
              <p>Adresse du portefeuille MetaMask</p>
              <p onClick={copyAddress} style={{cursor: "pointer", textDecoration: "underline", wordBreak: "break-all"}}>
                {account ? account : "Aucun portefeuille connecté"}
              </p>
              <p>Réseau blockchain</p>
              <h3>{networkName}</h3>
              <p>État de connexion</p>
              <h3 className={account ? "connected-status" : "disconnected-status"}>
                {account ? "Connecté" : "Non connecté"}
              </h3>
            </div>

            {!account && (
              <button className="primary-button" onClick={connectWallet}>Connecter MetaMask</button>
            )}

            <div className="dashboard-stats profile-stats">
              <div className="stat-card"><p>Total des demandes</p><h2>{totalRequests}</h2></div>
              <div className="stat-card"><p>Montant total demandé</p><h2>{totalAmount} ETH</h2></div>
            </div>

            <div className="notice">
              <span>ⓘ</span>
              <p>Votre adresse de portefeuille permet de vous identifier dans cette démonstration.</p>
            </div>
          </section>
        )}
      </main>

      <footer>
        CreditScore DApp · Prototype académique · Base Sepolia
      </footer>
    </div>
  );
}

export default App;