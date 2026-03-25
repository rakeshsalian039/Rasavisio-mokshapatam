// ═══ BOARD DATA — Snakes (Nāga), Ladders (Virtues), Dharma Squares ═══
// 
// TO EDIT: Each snake/ladder has:
//   - from (key): square number where snake/ladder starts
//   - to: square number where it sends you  
//   - skt: Sanskrit name
//   - en: English name
//   - tale: Short story shown in popup
//
// TO ADD A SNAKE: Add a new entry like  52:{to:28,skt:"विष",en:"POISON",tale:"..."}
// TO ADD A LADDER: Same format in LADDERS
// DLM_SQ: List of squares that trigger Dharma Dilemma cards

export const SNAKES={16:{to:4,skt:"क्रोध",en:"WRATH",tale:"As Duryodhana's rage consumed the Kuru dynasty..."},23:{to:7,skt:"लोभ",en:"GREED",tale:"Like Shakuni who gambled away an empire..."},33:{to:12,skt:"मोह",en:"DELUSION",tale:"Dhritarashtra's blind love veiled all judgment..."},38:{to:21,skt:"मात्सर्य",en:"ENVY",tale:"Duryodhana burned with jealousy at Indraprastha..."},47:{to:29,skt:"काम",en:"DESIRE",tale:"Keechaka's lust brought his annihilation..."},56:{to:41,skt:"मद",en:"PRIDE",tale:"Ravana's arrogance toppled golden Lanka..."},62:{to:44,skt:"भय",en:"TERROR",tale:"Arjuna paralysed before the great war..."},74:{to:51,skt:"द्वेष",en:"HATRED",tale:"Drona and Drupada's hatred echoed ages..."},85:{to:59,skt:"आलस्य",en:"SLOTH",tale:"Kumbhakarna slept while dharma crumbled..."},95:{to:68,skt:"अहंकार",en:"EGO",tale:"Parashurama's ego challenged even Rama..."}};
export const LADDERS={3:{to:18,skt:"दया",en:"COMPASSION",tale:"Yudhishthira who wept for his enemies..."},9:{to:31,skt:"दान",en:"GENEROSITY",tale:"Karna gave his armour without hesitation..."},22:{to:42,skt:"सत्य",en:"TRUTH",tale:"Harishchandra sacrificed all for truth..."},28:{to:52,skt:"सेवा",en:"SERVICE",tale:"Hanuman whose devotion moved mountains..."},37:{to:58,skt:"तपस्",en:"AUSTERITY",tale:"Vishwamitra whose tapas shook Indra..."},44:{to:65,skt:"श्रद्धा",en:"FAITH",tale:"Shabari waited a lifetime for Rama..."},53:{to:72,skt:"विद्या",en:"WISDOM",tale:"Vidura whose counsel was dharma itself..."},61:{to:80,skt:"विवेक",en:"DISCERNMENT",tale:"Bhishma on his bed of arrows..."},71:{to:89,skt:"भक्ति",en:"DEVOTION",tale:"Prahlada whose devotion survived fire..."},82:{to:97,skt:"वैराग्य",en:"DETACHMENT",tale:"Siddhartha leaving the palace..."}};
export const DLM_SQ=[5,10,14,19,25,30,35,43,48,55,60,64,69,73,78,83,88,92,94,97,99];

