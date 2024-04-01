from collections import defaultdict
import uuid


def filter_top_n(scores: dict[uuid.UUID, float], n: int) -> list[uuid.UUID]:
    """Returns the top n festivals based on the scores

    Args:
        scores (dict[int, float]): Dictionary with festival ID as key and score as value.
        n (int): Number of festivals to return

    Returns:
        list[int]: List of festival IDs sorted in descending order
    """
    top_n = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:n]
    return [festival_id for festival_id, score in top_n]


def combine_subscores(*subscores: dict[uuid.UUID, float]) -> dict[uuid.UUID, float]:
    """Combines subscores into a single score
    args:
        *subscores (dict[int, float]): List of subscores, each subscore is a dictionary with festival ID as key and score as value

    Returns:
        dict[int, float]: Dictionary with festival ID as key and score as value
    """
    combined_scores = defaultdict(float)  # noqa: F821

    for subscore in subscores:
        for festival_id, score in subscore.items():
            combined_scores[festival_id] += score

    return combined_scores
