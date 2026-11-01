// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreditContract {
    address public owner;
    
    struct Pret {
        address emprunteur;
        uint256 montant;
        uint256 score;
        bool estRembourse;
    }

    mapping(address => Pret) public prets;

    // Événement pour l'interface web
    event PretCree(address indexed emprunteur, uint256 montant, uint256 score);

    constructor() {
        owner = msg.sender;
    }

    // Fonction pour créer un prêt (simplifiée)
    // Dans la version finale, il faut vérifier la signature EIP-712 ici
    function creerPret(address _emprunteur, uint256 _montant, uint256 _score) public {
        require(msg.sender == owner, "Seul le proprietaire peut creer");
        require(_score > 70, "Score trop bas pour un pret");
        
        prets[_emprunteur] = Pret(_emprunteur, _montant, _score, false);
        emit PretCree(_emprunteur, _montant, _score);
    }

    function rembourser() public payable {
        Pret storage p = prets[msg.sender];
        require(!p.estRembourse, "Deja rembourse");
        require(msg.value >= p.montant, "Montant insuffisant");
        
        p.estRembourse = true;
    }
}