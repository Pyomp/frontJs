import {
    ACTION_0,
    ACTION_1,
    ACTION_10,
    ACTION_11,
    ACTION_2,
    ACTION_3,
    ACTION_4,
    ACTION_5,
    ACTION_6,
    ACTION_7,
    ACTION_8,
    ACTION_9,
} from "../constantsActions.js"

// display front
// send actions
// update actions

export const BERSERKER = {
    get SKILLS() {
        return {
            [ACTION_0]:{
                "name": "Jump",
                "image": new URL('./thrust.svg', import.meta.url),
                "cooldown": 0,
                "effect": "Jump. Leap to your feet when you are knocked down. You become briefly immune to knockdown, stagger, and stuns.",
                "usage": "Use the skill to jump. The second jump is higher. The third one even more."
            },
            [ACTION_1]: {
                "name": "Axe Block",
                "image": new URL('../../../assets/skills/berserker/axeBlock.png', import.meta.url),
                "cooldown": 0,
                "effect": "Block frontal attacks with your weapon. Damage blocked depends on your weapon's stats. Remains active as long as you hold down the skill button. On successful block, allies behind you are also protected.",
                "combo": "While Intimidation is active, damage blocked increases by 60%.",
                "usage": "Use the skill to block frontal attacks. Remains active as long as you hold down the skill button."
            },
            [ACTION_2]: {
                "name": "Thunder Strike",
                "image": new URL('../../../assets/skills/berserker/thunderStrike.png', import.meta.url),
                "cooldown": 3,
                "damage": 5882,
                "effect": "Charge Skill. Charge up your axe to deliver a devastating attack. The longer you hold down the skill button, the greater the damage. Charges to three levels. Overcharging beyond three levels will damage your HP 1% per level. Can be overcharged up to 4 times.",
                "usage": "Press and hold the skill button, then release it while facing the target."
            },
            [ACTION_3]: {
                "name": "Flatten",
                "image": new URL('../../../assets/skills/berserker/flatten.png', import.meta.url),
                "cooldown": 8,
                "damage": 3284,
                "effect": "Pound the ground, knocking down targets within 4m. Consumes 1% of your Max. HP.",
                "combo": "This skill activates faster when following Sweeping Strike, Raze, Punishing Strike, or Overwhelm.",
                "usage": "Press the skill button while facing the target."
            },
            [ACTION_4]: {
                "name": "Sweeping Strike",
                "image": new URL('../../../assets/skills/berserker/sweepingStrike.png', import.meta.url),
                "cooldown": 20,
                "damage": 1381,
                "effect": "Make a sweeping attack that briefly stuns and turns your target around. Consumes 1% of your Max. HP. Speeds charging of Thunder Strike by 30% for a few seconds.",
                "usage": "Press and hold the skill button, then release it while facing the target."
            },
            [ACTION_5]: {
                "name": "Cyclone",
                "image": new URL('../../../assets/skills/berserker/cyclone.png', import.meta.url),
                "cooldown": 7,
                "damage": 4469,
                "effect": "Charge Skill. Swing your axe to strike targets around you. The longer you charge, the more you increase skill damage and spin energy. Can charge to three levels. Charging above level 3 continuously consumes HP by 1%, but gradually increases skill damage. When charged to level 3 or higher, pulls nearby targets toward you. Can be overcharged 5 times. Using the skill against other players does not pull them towards you, but every 3 hits will cause them to stagger.",
                "usage": "Hold down the skill button then release while facing a target in range. Effective on multiple targets."
            },
            [ACTION_6]: {
                "name": "Leaping Strike",
                "image": new URL('../../../assets/skills/berserker/leapingStrike.png', import.meta.url),
                "cooldown": 7,
                "damage": 647,
                "effect": "Jump at your foe and smash downward. Knocked-down foes take greater damage. 30% chance to eliminate cooldown.",
                "usage": "Use the skill while facing the target."
            },
            [ACTION_7]: {
                "name": "Lethal Strike",
                "image": new URL('../../../assets/skills/berserker/lethalStrike.png', import.meta.url),
                "cooldown": 7,
                "damage": 3966,
                "effect": "Sacrifice 2% of Maximum HP and strike your foes as you rush forward. Increases your skill damage as your HP decreases. 50% chance to eliminate cooldown.",
                "combo": "Activates faster if you first use Thunder Strike or Cyclone.",
                "usage": "Use the skill while facing the target."
            },
            [ACTION_8]: {
                "name": "Raze",
                "image": new URL('../../../assets/skills/berserker/raze.png', import.meta.url),
                "cooldown": 7,
                "damage": 1762,
                "effect": "Slash and knock down monsters around you while moving forward. Consumes 1% of your Max. HP. Speeds casting of Thunder Strike by 25% for a few seconds.",
                "combo": "Activates faster following Combo Attack, Thunder Strike, Cyclone, Axe Counter, and Punishing Strike.",
                "usage": "Press the skill button while facing a target. Use after other skills for better effect."
            },
            [ACTION_9]: {
                "name": "Tackle",
                "image": new URL('../../../assets/skills/berserker/tackle.png', import.meta.url),
                "cooldown": 16,
                "damage": 2726,
                "effect": "Spin your axe to hurl a bolt that knocks down an enemy up to 18m away. Consumes 1% of your Max. HP.",
                "usage": "Target an enemy and press the skill button."
            },
            [ACTION_10]: {
                "name": "Evasive Roll",
                "image": new URL('../../../assets/skills/berserker/evasiveRoll.png', import.meta.url),
                "cooldown": 5,
                "effect": "Dodge your enemy's attack. Invincible while moving. You can move through units without restriction.",
                "usage": "Use to escape or move quickly."
            },
            [ACTION_11]: {
                "name": "Overwhelm",
                "image": new URL('../../../assets/skills/berserker/overwhelm.png', import.meta.url),
                "cooldown": 12,
                "damage": 1888,
                "effect": "Charge up to 18m and attack your enemy. Attack has a high chance of knockdown against monsters. Speeds charging of Cyclone by 30% for a few seconds",
                "usage": "Face the target, then press the skill button."
            }

        }
    }
}
