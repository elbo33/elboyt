"""On-screen text for English. Imported dynamically by scene files based on
the SCENE_LANG environment variable — see manim/scenes/title_card.py.
"""

LABELS = {
    "title": "I Taught an AI to Play Tic-Tac-Toe (From Nothing)",
    "q_table_title": "The Q-Table",
    "q_table_row": "one row per board, one column per move",
    "q_table_allzero": "at the start: every score is zero",
    "reward_loop_title": "Play -> Result -> Nudge",
    "reward_loop_win": "win -> nudge those moves up",
    "reward_loop_lose": "lose -> nudge those moves down",
    "explore_exploit_title": "Explore vs. Exploit",
    "exploit_label": "exploit: play the best-known move",
    "explore_label": "explore: sometimes play a random move",
    "winrate_title": "Win Rate vs. Random Opponent",
    "winrate_caption": "climbing over thousands of self-played games",
}
