# Narration — Why is the sum of the first n odd numbers a perfect square?

Word-for-word narrator script for the silent long-form video
(`why-is-the-sum-of-the-first-n-odd-numbers-a-perfect-square.mp4`, 8:15).

One section per chapter, in order, with an approximate start time. Read at a calm
pace, roughly 150 words per minute; each block is written to fit its chapter.
Everything the narrator says is also visible on screen — the script explains the
visuals, it doesn't add new facts.

---

## 1 · Intro — 0:00

Here is a pattern that looks a little too neat to be an accident. Start with one.
One, on its own, is one. Now add the next odd number, three: one plus three is
four. Add the next odd number, five: one plus three plus five is nine. Add seven:
now we are at sixteen. One, four, nine, sixteen — those are the perfect squares.
One squared, two squared, three squared, four squared. Every time we add the next
odd number, the running total lands exactly on a square. The whole point of this
video is to show you why that has to happen, and why it can never break.

## 2 · Roadmap — 0:19

Here is how we will get there. First, the setup: what "odd number" and "partial
sum" actually mean. Then one slow build of the whole idea, from one up to six
squared, without stopping. Then nine worked cases — two squared through ten
squared — each one using the exact same move, so you can see the pattern is a
routine, not a fluke. Then we read the pattern back off the results, take one big
jump to n equals twelve, and finally prove the step in general — with a picture,
with three independent arguments, and with the algebra. Every worked example has
the same shape: show the case, then explain why it cannot fail.

## 3 · The Setup — 0:39

Two words first. "Odd numbers" are one, three, five, seven, nine, and so on —
you skip every second whole number. Here they are marked on the line. A "partial
sum" just means: add the first few of them, left to right, and watch the running
total as you go. We will represent each unit as a single square cell — one cell
is one. So the question, precisely, is this: as we keep adding the next odd
number, why does the running total keep landing on one, four, nine, sixteen —
the perfect squares — and never anywhere in between?

## 4 · Master Build — 1:09

Watch the whole idea happen once. We start with a single cell — that is one.
Now we add three cells, wrapped around it as an L-shape: the total is four, and
the shape is a two-by-two square. Add the next odd number, five, as a bigger
L around the outside: nine cells, a three-by-three square. Add seven: sixteen, a
four-by-four square. Add nine: twenty-five. Add eleven: thirty-six — a perfect
six-by-six square. Six odd numbers, six L-shaped layers, and at every single step
the shape stayed a square. Nothing else happened.

## 5 · Example 1 — 1:33

Now the same move, one case at a time. We start from a one-by-one square — that
is one. The next odd number is three. Count the cells in the L: one, two, three.
Add them around the outside, and the one-by-one square becomes a two-by-two
square. One plus three is four, which is two squared. First row in the ledger.

## 6 · Example 2 — 1:58

Same move again, one size up. Start from the two-by-two square — that is four.
The next odd number is five. Count the L: five cells. Wrap it around, and the
two-by-two square becomes a three-by-three square. One plus three plus five is
nine, which is three squared. The ledger grows.

## 7 · Example 3 — 2:24

Start from the three-by-three square — nine. The next odd number is seven. Seven
cells in the L. Wrap it around, and we get a four-by-four square. One plus three
plus five plus seven is sixteen, which is four squared. Notice that the beats
have not changed at all: start square, count the L, wrap, read the result.

## 8 · Example 4 — 2:51

Start from four-by-four — sixteen. The next odd number is nine. Nine cells wrap
around the outside, and the square becomes five-by-five. The total is twenty-five
— five squared. Same move.

## 9 · Example 5 — 3:19

Start from five-by-five — twenty-five. The next odd number is eleven. Eleven
cells in the L. Wrap it, and we have a six-by-six square: thirty-six, which is
six squared. The L is bigger; the idea is not.

## 10 · Example 6 — 3:48

Start from six-by-six — thirty-six. The next odd number is thirteen. Thirteen
cells wrap the square into a seven-by-seven square. Forty-nine — seven squared.
Still one move.

## 11 · Example 7 — 4:18

Start from seven-by-seven — forty-nine. The next odd number is fifteen. Fifteen
cells in the L, wrapped around, and the square becomes eight-by-eight. Sixty-four
— eight squared. Seven cases now, and not one new idea.

## 12 · Example 8 — 4:48

Start from eight-by-eight — sixty-four. The next odd number is seventeen.
Seventeen cells wrap the square into nine-by-nine. Eighty-one — nine squared. By
now you can predict every beat before it happens.

## 13 · Example 9 — 5:19

Start from nine-by-nine — eighty-one. The next odd number is nineteen. Nineteen
cells in the L. Wrap it around, and the nine-by-nine square becomes a ten-by-ten
square. Eighty-one plus nineteen is one hundred — ten squared. Nine cases, zero
new ideas.

## 14 · Pattern Check — 5:51

Line up the squares themselves: one, four, nine, sixteen, twenty-five,
thirty-six, forty-nine, sixty-four. Now look at the gaps between them. Four minus
one is three. Nine minus four is five. Sixteen minus nine is seven. The gaps are
three, five, seven, nine, eleven, thirteen, fifteen — the odd numbers, in order.
That is the pattern, stated the other way round: to get from one square to the
next, you add the next odd number.

## 15 · Big Jump — 6:10

Let's jump far from the small cases. Take n equals twelve — the first twelve odd
numbers. Add them on, one L-shaped layer at a time, and the running total climbs:
one, four, nine, all the way up. The last odd number added is twenty-three, and
the total is one hundred forty-four — which is twelve squared. No new idea
happened here; it is just twelve copies of the same wrapping move. Still a
square.

## 16 · The Reason — 6:29

Here is why it can never fail. Take any n-by-n square. Its next L-shaped layer is
one row along the top plus one column down the side, and they share a single
corner. That is n cells on top, n cells on the side, plus the one shared corner:
n plus n plus one, which is two n plus one. Add that L to the n-by-n square and
every side grows by one — you get an (n plus one)-by-(n plus one) square. In
symbols: n squared plus two n plus one equals (n plus one) squared. And two n
plus one is exactly the next odd number. So each odd number is precisely the gap
between one square and the next.

## 17 · 2n + 1, Three Ways — 6:57

Three independent ways to see that the L has two n plus one cells. One: count it
directly — n along the top, n down the side, one in the shared corner. Two:
subtract the squares — (n plus one) squared minus n squared expands to two n plus
one. Three: walk the odd numbers — the n-th odd number is two n minus one, so the
very next one is two n plus one. Three different routes, the same number. That is
why the pattern is forced.

## 18 · The Algebra — 7:16

The same thing in pure symbols. Expand (n plus one) squared: it is n squared plus
two n plus one. Subtract n squared from both sides: the jump from one square to
the next is always two n plus one — an odd number. Now stack it up. One is one
squared. One plus three is two squared. One plus three plus five is three
squared. Each row is the row above it plus the next odd number — and adding the
next odd number is exactly what turns one square into the next. So one plus three
plus five, all the way to two n minus one, equals n squared.

## 19 · Recap — 7:40

One move, repeated. One plus three is two squared. One plus three plus five is
three squared. One plus three plus five plus seven is four squared. And in
general, one plus three plus all the way to two n minus one is n squared. Every
one of those lines is the same picture: an n-by-n square, plus an L of two n plus
one cells, making an (n plus one)-by-(n plus one) square. Every odd number is the
L-shaped gap between one square and the next.

## 20 · Outro — 8:02

So there it is. The sum of the first n odd numbers is always n squared — not
sometimes, always — because the odd numbers are the seams between consecutive
squares. Add one, and you step from one perfect square exactly onto the next.
