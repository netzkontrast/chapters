"""Muse Level Progression Service"""
from sqlalchemy.orm import Session
from app.models.user import User

# Muse levels and XP thresholds
MUSE_LEVELS = {
    "spark": {"name": "Spark", "xp_required": 0, "next": "shaper"},
    "shaper": {"name": "Shaper", "xp_required": 100, "next": "echo"},
    "echo": {"name": "Echo", "xp_required": 300, "next": "resonance"},
    "resonance": {"name": "Resonance", "xp_required": 600, "next": None},
}

# XP rewards for different actions
XP_REWARDS = {
    "publish_chapter": 10,
    "read_chapter": 2,
    "finish_book": 15,
    "bookmark": 3,
    "margin_comment": 5,
    "receive_heart": 1,
}


def get_muse_info(user: User) -> dict:
    """
    Get current muse level information for a user.
    
    Returns:
        dict: Muse level info including name, current XP, and progress to next level
    """
    current_level = MUSE_LEVELS.get(user.muse_level, MUSE_LEVELS["spark"])
    next_level_key = current_level.get("next")
    
    result = {
        "level": user.muse_level,
        "level_name": current_level["name"],
        "xp": user.muse_xp,
        "xp_required": current_level["xp_required"],
    }
    
    if next_level_key:
        next_level = MUSE_LEVELS[next_level_key]
        result["next_level"] = next_level_key
        result["next_level_name"] = next_level["name"]
        result["xp_to_next"] = next_level["xp_required"] - user.muse_xp
    else:
        result["next_level"] = None
        result["next_level_name"] = None
        result["xp_to_next"] = 0
    
    return result


def award_xp(db: Session, user: User, action: str) -> dict:
    """
    Award XP to a user for an action and check for level up.
    
    Args:
        db: Database session
        user: User to award XP to
        action: Action that earned XP (from XP_REWARDS keys)
    
    Returns:
        dict: Result with xp_gained, new_total, and level_up info
    """
    xp_gained = XP_REWARDS.get(action, 0)
    
    if xp_gained == 0:
        return {"xp_gained": 0, "xp_total": user.muse_xp, "leveled_up": False}
    
    old_level = user.muse_level
    user.muse_xp += xp_gained
    
    # Determine the correct level based on XP
    level_order = ["spark", "shaper", "echo", "resonance"]
    new_level = "spark"
    
    for level_key in reversed(level_order):
        if user.muse_xp >= MUSE_LEVELS[level_key]["xp_required"]:
            new_level = level_key
            break
    
    leveled_up = new_level != old_level
    new_level_name = MUSE_LEVELS[new_level]["name"] if leveled_up else None
    
    if leveled_up:
        user.muse_level = new_level
    
    db.commit()
    db.refresh(user)
    
    return {
        "xp_gained": xp_gained,
        "xp_total": user.muse_xp,
        "leveled_up": leveled_up,
        "old_level": old_level,
        "new_level": new_level if leveled_up else None,
        "new_level_name": new_level_name,
    }


def can_use_feature(user: User, feature: str) -> bool:
    """
    Check if user's muse level allows access to a feature.
    
    Features by level:
    - spark: prompts, titles, covers
    - shaper: structure and theme insight
    - echo: voice memory and remixing
    - resonance: connection facilitation
    """
    level_order = ["spark", "shaper", "echo", "resonance"]
    
    # Handle invalid muse level gracefully
    try:
        user_level_index = level_order.index(user.muse_level)
    except ValueError:
        # Default to spark if invalid level
        user_level_index = 0
    
    feature_requirements = {
        "prompts": 0,  # spark
        "titles": 0,  # spark
        "covers": 0,  # spark
        "structure": 1,  # shaper
        "themes": 1,  # shaper
        "voice_memory": 2,  # echo
        "remixing": 2,  # echo
        "connections": 3,  # resonance
    }
    
    required_level = feature_requirements.get(feature, 0)
    return user_level_index >= required_level
