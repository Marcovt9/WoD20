/**
 * WARNING: Remember, if you change anything in this file, it will get overwritten when the system updates. 
 * So make a backup of any changes, and re-apply them afterwards.
 */

// Namespace Configuration Values
export const MTA = {};

const path = 'systems/WoD20/icons/placeholders/';

/**
 * The paths to the individual placeholder icons
 * for each item type within the system.
 * Feel free to modify, but add the corresponding
 * icon in the placeholder path.
 * Note: There is a bug in Firefox with svg icons which
 * have an explicity width and height.
*/
MTA.placeholders = new Map([
  ["relationship", path + 'Relationship.svg'],
  ["service", path + 'Service.svg'],
  ["container", path + 'Container.svg'],
  ["merit", path + 'Merit.svg'],
  ["firearm", path + 'Firearm.svg'],
  ["melee", path + 'Melee.svg'],
  ["unarmed", path + 'Unarmed.svg'],
  ["thrown", path + 'Thrown.svg'],
  ["equipment", path + 'Equipment.svg'],
  ["armor", path + 'Armor.svg'],
  ["ammo", path + 'Ammo.svg'],
  ["rite", path + 'Rite.svg'],
  ["discipline_power", path + 'DisciplinePower.svg'],
  ["vehicle", path + 'Vehicle.svg'],
  ["formAbility", path + 'Manifestation.svg'],
  ["form", 'systems/WoD20/icons/forms/Gauru.svg'],
]);

/**
 * The trait maximum for attribute & skill buffs.
 * if the trait has a higher base value on the sheet,
 * that value is used instead.
 * Change it freely.
*/
MTA.traitMaximum = 100; // The absolute trait buff maximum (though it could be infinite in theory...)
MTA.traitMaximumLower = 5; // The maximum used for buffs without the checkbox, only used for attributes&skills, not derived traits

/**
 * The list of supported character types.
 * Any value added to this list will fall back to the Mortal sheet.
 * @type {Array[]}
 */
MTA.characterTypes = ["Mortal", "Vampire", "Scion"];

/**
 * The list of supported ephemeral entity types.
 * Any value added to this list will fall back to the ??? sheet.
 * @type {Array[]}
 */

MTA.all_traits = {
  attributes: {
    name: "MTA.Attributes",
    list: [
      "attributes_physical",
      "attributes_social",
      "attributes_mental"
    ]
  },
  skills: {
    name: "MTA.Skills",
    list: [
      "skills_physical",
      "skills_social",
      "skills_mental"
    ]
  },
  traits: {
    name: "MTA.Traits",
    list: [
      "derivedTraits"
    ]
  },
  vampire_traits: {
    name: "MTA.Vampire_traits",
    list: [
      "vampire_traits",
      "disciplines_common",
      "disciplines_unique",
    ]
  }
}


/**
 * The set of ephemeral attributes used within the system.
 * I know these attributes are technically not physical, social, and mental,
 * but do you seriously expect me to call these lists eph_power, etc.?
 * While new attributes can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.eph_physical = {
  "power": "MTA.EphPower"
};
MTA.eph_social = {
  "finesse": "MTA.EphFinesse"
};
MTA.eph_mental = {
  "resistance": "MTA.EphResistance"
};


/**
 * The set of Attributes used within the system.
 * While new attributes can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.attributes_physical = {
    "strength": "MTA.Strength",
    "dexterity": "MTA.Dexterity",
    "stamina": "MTA.Stamina"
  };
MTA.attributes_social = {
    "presence": "MTA.Presence",
    "manipulation": "MTA.Manipulation",
    "composure": "MTA.Composure"
  };
MTA.attributes_mental = {
    "intelligence": "MTA.Intelligence",
    "wits": "MTA.Wits",
    "resolve": "MTA.Resolve"
  };

/**
 * The set of Skills used within the system.
 * While new skills can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.skills_physical = {
    "athletics": "MTA.Athletics",
    "brawl": "MTA.Brawl",
    "drive": "MTA.Drive",
    "firearms": "MTA.Firearms",
    "larceny": "MTA.Larceny",
    "stealth": "MTA.Stealth", 
    "survival": "MTA.Survival",
    "weaponry": "MTA.Weaponry"
  };
MTA.skills_social = {
    "animalKen": "MTA.AnimalKen",
    "empathy": "MTA.Empathy",
    "expression": "MTA.Expression",
    "intimidation": "MTA.Intimidation",
    "persuasion": "MTA.Persuasion",
    "socialize": "MTA.Socialize", 
    "streetwise": "MTA.Streetwise",
    "subterfuge": "MTA.Subterfuge"
  };
MTA.skills_mental = {
    "academics": "MTA.Academics",
    "computer": "MTA.Computer",
    "crafts": "MTA.Crafts",
    "investigation": "MTA.Investigation",
    "medicine": "MTA.Medicine",
    "occult": "MTA.Occult", 
    "politics": "MTA.Politics",
    "science": "MTA.Science"
  };

/**
 * The set of Derived Traits used within the system.
 * Do not modify.
 * @type {Object}
 */
MTA.derivedTraits = {
  "speed": "MTA.Speed",
  "armor": "MTA.Armor",
  "initiativeMod": "MTA.Initiative",
  "ballistic": "MTA.BallisticArmor",
  "perception": "MTA.Perception",
  "health": "MTA.Health"
}


/**
 * The set of Derived Dream Traits used within the system.
 * Do not modify.
 * @type {Object}
 */

MTA.attributes_physical_dream = {
  "power": "MTA.EphPower"
};

MTA.attributes_social_dream = {
  "finesse": "MTA.EphFinesse"
};

MTA.attributes_mental_dream = {
  "resistance": "MTA.EphResistance"
};


/**
 * The list of firearm ammunition.
 * Can freely be modified.
 * @type {Array[]}
 */
MTA.cartridges = ["9mm", ".38 Special", ".44 Magnum", ".45 ACP", "30.06", "5.56mm", "12-gauge", "Arrow", "Bolt", "Fuel Canister"];

/**
 * The list of relationship impressions.
 * Can freely be modified.
 * @type {Array[]}
 */
MTA.impressions = ["Hostile","Average","Good","Excellent","Perfect"];

/**
 * A list of item types that only normal characters use, to make sure that other characters can't use them.
 */
MTA.characterItemTypes = [
 "relationship", "rite", "discipline_power", "form", "formAbility"
]

/**
 * The set of colours used as the border around portraits in the 
 * actor directory, when the user is the GM, or the character type
 * is set to visible on the character sheet.
 * @type {Object}
 */
MTA.typeColors = {
  unknown: "DimGray", 
  Mortal: "White",
  Vampire: "Crimson",
  Scion: "Gold",
};

/**
 * The list of supported melee weapon types.
 * Values added here will fall back to using Strength + Weaponry as
 * the associated dice pool for rolling.
 * @type {Array[]}
 */
MTA.meleeTypes = ["Melee", "Unarmed", "Thrown"];

/* -------------------------------------------- */
/*          Scion                               */
/* -------------------------------------------- */



/* -------------------------------------------- */
/*          Vampire                             */
/* -------------------------------------------- */

MTA.bloodPotency_levels = [
    {vitae_per_turn: 1, max_vitae: undefined},
    {vitae_per_turn: 1, max_vitae: 10},
    {vitae_per_turn: 2, max_vitae: 11},
    {vitae_per_turn: 3, max_vitae: 12},
    {vitae_per_turn: 4, max_vitae: 13},
    {vitae_per_turn: 5, max_vitae: 15},
    {vitae_per_turn: 6, max_vitae: 20},
    {vitae_per_turn: 7, max_vitae: 25},
    {vitae_per_turn: 8, max_vitae: 30},
    {vitae_per_turn: 10, max_vitae: 50},
    {vitae_per_turn: 15, max_vitae: 75}
  ];
MTA.actionTypes = ["Instant", "Reflexive", "Contested vs", "Contested (refl. resist.) vs", "Extended"];
MTA.rite_withstandTypes = ["Resisted by", "Contested by"];


/**
 * The set of Vampire disciplines.
 * The separation into common and unique is purely for display purposes (and not even correct).
 * Can freely be modified.
 * @type {Object}
 */
MTA.disciplines_common = {
  "celerity": "MTA.DisciplineCelerity",
  "animalism": "MTA.DisciplineAnimalism",
  "obfuscate": "MTA.DisciplineObfuscate",
};

MTA.disciplines_unique = {
  "auspex": "MTA.DisciplineAuspex",
  "dominate": "MTA.DisciplineDominate",
  "protean": "MTA.DisciplineProtean",
};

/**
 * The set of rollable Vampire traits used within the system.
 * Do not modify.
 * @type {Object}
 */
 MTA.vampire_traits = {
  "bloodPotency": "MTA.BloodPotency",
  "humanity": "MTA.Humanity"
}