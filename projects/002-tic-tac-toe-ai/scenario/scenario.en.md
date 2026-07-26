# I Taught an AI to Play Tic-Tac-Toe (From Nothing) — Script (EN)

## 01. Cold Open
This AI starts knowing zero tic-tac-toe: no rules, no strategy. We'll build its brain from scratch, then I'll try to beat it. Spoiler: I don't.

## 02. Title Card
(No voiceover — title card carries the beat.)

## 03. What Does "Learning" Even Mean?
Here's the trick: this AI doesn't "understand" tic-tac-toe any more than a
dog understands why sitting gets it a treat. Teach a dog, and you reward
the behavior you want and ignore the one you don't — do it enough times,
and the rewarded behavior starts happening more. That's the whole idea
behind "learning" here. No strategy built in by hand — just a system that
plays a move, gets a reward or a punishment depending on how the game
ends, and slowly starts preferring the moves that led to rewards. We're
about to build the simplest possible version of that.

## 04. Meet the Q-Table
Every AI like this keeps a giant lookup table called a Q-table — think of
it as a spreadsheet with one row for every board it might see, and one
column for every move it could make from that board. Each cell holds one
number: how good that move looked, based on everything the AI has learned
so far. At the very start, every number in this table is zero. The AI has
no opinion about any move on any board — it's a blank spreadsheet.
Everything we're about to build is really one question, asked millions of
times: after this game ends, which numbers should go up, and which should
go down?

## 05. How Q-Values Get Nudged
Here's the loop that does all the work. The AI looks at the board, checks
its table, and plays whatever move currently has the highest number for
this position. The game plays out — maybe it wins, maybe it loses, maybe
it's a draw. Then the update happens: every move the AI made that game
gets nudged. A win nudges those moves' numbers up a little. A loss nudges
them down. A draw barely moves them at all. One game teaches almost
nothing. But run this loop ten thousand times, and moves that tend to lead
to wins slowly float to the top of the table — without the AI ever being
told a single rule of strategy.

## 06. Explore vs. Exploit
There's one problem with always picking the highest-scoring move: early
on, every score is basically a guess, so the AI can get stuck confidently
repeating a bad habit it happened to try first. The fix is called
epsilon-greedy. Most of the time, the AI plays its best-known move. But
some percentage of the time — say, ten percent — it deliberately plays a
random move instead, just to see what happens. That's exploring instead of
exploiting. Without it, the AI would settle into a corner and never find
the better moves it hasn't tried yet.

## 07. Building It: The Board & Win Checker
Let's build this for real. The board is just a list of nine spots, empty
or X or O. A move is picking an empty spot and marking it. The only other
piece we need before any learning happens is a win checker — something
that looks at the board and asks: is there three-in-a-row, in any of the
eight ways that can happen? If yes, the game is over and we know who won.
If every spot is filled and nobody has three in a row, it's a draw. That's
the entire game engine — a list, a function to make a move, and a function
to check for a winner. No AI yet, just the rules of tic-tac-toe written
down as code.

## 08. Building It: The Q-Table & Training Loop
Now the actual learning. The Q-table is just a Python dictionary — the key
is the board's current state, the value is a score for every move
available from it. When the AI needs to move, it looks up the current
board; if it's never seen this exact board before, every move starts at
zero. Then the training loop: play a full game where the AI controls both
sides, using epsilon-greedy to decide each move. When the game ends, walk
back through every move that was made and nudge its score — up for the
winning side, down for the losing side, barely at all for a draw. Reset
the board, and do it again, thousands of times over. That's genuinely the
whole algorithm — no neural network, no gradient descent, just a
dictionary that gets slightly better every single game.

## 09. Thousands of Games Later
So does this actually work? Here's the AI's win rate against a
random-move opponent, tracked every hundred games during training. In the
first few hundred games it's basically a coin flip — the table is still
mostly zeros. But watch what happens as training continues: the line
climbs, fast at first, then leveling off as it approaches the best a
perfect player can do. By a few thousand games in, this dictionary of
numbers has, in every practical sense, learned to play tic-tac-toe.

## 10. Let's Play
Alright — my turn. I'm playing X, the trained AI is O, and I'm going to
try my absolute best to beat it. Okay, standard opening. Reasonable
response. I'm setting up a fork here — watch. ...it saw that coming. Let's
try the other side. Blocked again. That's a draw — it blocked both of my
forks perfectly. One more game, more aggressive this time. ...also a draw.
A perfectly-trained tic-tac-toe agent literally cannot be beaten — the
best any opponent can force is a draw — and that's exactly what this
dictionary of numbers has converged on, without one hardcoded rule about
how to play well.

## 11. Why This Matters
Now, tic-tac-toe is small enough that a table like this can hold every
board it will ever see. Chess and Go can't do that — there are more
possible board states than atoms in the observable universe, so a lookup
table is completely off the table. That's exactly why systems like
AlphaGo swap the table for a neural network: instead of looking up a
score, the network estimates one. But the core loop underneath — try
something, see if it worked, nudge your future choices based on the
outcome — is the exact same idea you just watched happen in nine cells and
a dictionary.

## 12. Wrap-up
So that's reinforcement learning in its simplest possible form: no rules
taught by hand, just trial, error, and a slowly-improving table of
numbers. If you want to build this yourself, the code's linked below. See
you in the next one.
