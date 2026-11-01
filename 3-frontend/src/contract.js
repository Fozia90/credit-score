export const CONTRACT_ADDRESS = "0x981e8DaC1b99c2Eea80FeaF3c3E3c4efA111c738";

export const CONTRACT_ABI = [
	{
		"inputs": [
			{ "internalType": "address", "name": "_emprunteur", "type": "address" },
			{ "internalType": "uint256", "name": "_montant", "type": "uint256" },
			{ "internalType": "uint256", "name": "_score", "type": "uint256" }
		],
		"name": "creerPret",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "emprunteur", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "montant", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" }
		],
		"name": "PretCree",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "rembourser",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"name": "prets",
		"outputs": [
			{ "internalType": "address", "name": "emprunteur", "type": "address" },
			{ "internalType": "uint256", "name": "montant", "type": "uint256" },
			{ "internalType": "uint256", "name": "score", "type": "uint256" },
			{ "internalType": "bool", "name": "estRembourse", "type": "bool" }
		],
		"stateMutability": "view",
		"type": "function"
	}
];