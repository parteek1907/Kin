"""
Pseudonym generation and avatar theme allocation for Kin Ghost Mode.
Generates completely decoupled, opaque aliases and handles without
using real names, email addresses, student IDs, or identifying attributes.
"""

import secrets
import uuid

ADJECTIVES = [
    "Amber", "Azure", "Cerulean", "Cobalt", "Crimson", "Emerald",
    "Golden", "Indigo", "Jade", "Lapis", "Lunar", "Opal",
    "Platinum", "Quartz", "Ruby", "Sapphire", "Silver", "Solar",
    "Teal", "Velvet", "Topaz", "Beryl", "Obsidian", "Sienna"
]

ARCHETYPES = [
    "Architect", "Artisan", "Beacon", "Cartographer", "Chronicle", "Cipher",
    "Curator", "Explorer", "Guide", "Navigator", "Observer", "Pathfinder",
    "Pioneer", "Scholar", "Seeker", "Sentinel", "Strategist", "Voyager",
    "Wanderer", "Weaver", "Mentor", "Thinker", "Builder", "Alchemist"
]

AVATAR_THEMES = [
    "ghost_theme_aurora",
    "ghost_theme_midnight",
    "ghost_theme_zenith",
    "ghost_theme_nebula",
    "ghost_theme_solstice",
    "ghost_theme_ember",
    "ghost_theme_prism",
    "ghost_theme_oceanic",
]

PALETTES = [
    "indigo", "violet", "teal", "emerald", "amber", "rose", "cyan", "slate"
]


def generate_pseudonym_profile() -> dict:
    """
    Generates a fresh, unlinked pseudonymous persona profile with an opaque handle.
    """
    adj = secrets.choice(ADJECTIVES)
    arc = secrets.choice(ARCHETYPES)
    alias = f"{adj} {arc}"
    
    # 8-char random hex suffix for handle
    random_hex = secrets.token_hex(4)
    handle = f"ghost-usr-{random_hex}"
    
    avatar_seed = secrets.choice(AVATAR_THEMES)
    palette = secrets.choice(PALETTES)

    return {
        "persona_handle": handle,
        "pseudonym": alias,
        "avatar_seed": avatar_seed,
        "theme_color": palette
    }
