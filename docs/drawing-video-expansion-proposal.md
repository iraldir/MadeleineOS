# Drawing video expansion — approved implementation record

Prepared and approved 10 October 2026. **The user approved all 92 candidates and requested that the changes be pushed.** The catalogue additions, dedicated tags and balanced selection logic have been applied and verified.

## Scope and verification

The drawing library originally contained **92 videos** in `services/youtubeService.ts`. The **92 approved videos below** have been added for **184 drawing videos**. Other video categories are outside this proposal.

Candidates were checked against the YouTube Data API: returned video title, uploading channel, duration and `status.embeddable: true`. Search used strict SafeSearch and the embeddable-video filter. All 92 IDs are unique and absent from the entire existing service catalogue. This verifies metadata and embedding status at research time; it does **not** certify full playback, instructional pace, ads, future availability or every frame. These are review candidates, not a fully watched collection. After approval, all 92 IDs were rechecked: each was public, processed and embeddable, with no regional restrictions reported by the API. Full playback was not watched.

“Generic” means the subject is not an established named entertainment character: animals, plants, food, objects and scenes qualify, including cartoon faces on ordinary objects. Branded characters such as Pusheen, Squishmallows, Mario plants and Pokémon balls were excluded. Lessons advertised as advanced and short teaser clips were excluded. Some floral lessons involve finer detail; their duration is shown to help review. Most choices are short, child-oriented step-by-step lessons; pause/replay remains useful.

The list deliberately includes several creators. A small number of subjects recur in different approaches (e.g. race car/toy car, rainbows); normalized subject tags will prevent them appearing together. The table links directly to each creator’s YouTube video.

## Plants and flowers (18)

| # | Approved tutorial | Creator | Length |
| --- | --- | --- | --- |
| 1 | [How To Draw A Flower (Tulip)- Preschool](https://www.youtube.com/watch?v=MX3vHndP4YM) | Art for Kids Hub | 4:51 |
| 2 | [How To Draw A Hibiscus Flower 🌺](https://www.youtube.com/watch?v=ao2IP7f23-8) | Art for Kids Hub | 4:47 |
| 3 | [How To Draw A Lotus Flower](https://www.youtube.com/watch?v=KB_RQACWFbg) | Art for Kids Hub | 8:57 |
| 4 | [How To Draw A Daisy Flower](https://www.youtube.com/watch?v=TMYhplLC9oo) | Art for Kids Hub | 7:40 |
| 5 | [How To Draw A Sunflower](https://www.youtube.com/watch?v=i_pQWFkZJrc) | Art for Kids Hub | 5:30 |
| 6 | [How To Draw A Flower Bouquet](https://www.youtube.com/watch?v=0-jHiAovALE) | Art for Kids Hub | 9:48 |
| 7 | [How To Draw A Tree](https://www.youtube.com/watch?v=gExU54kVM0o) | Art for Kids Hub | 8:20 |
| 8 | [How To Draw A Fall Tree](https://www.youtube.com/watch?v=6sAdj6NoLzA) | Art for Kids Hub | 6:59 |
| 9 | [How To Draw A Palm Tree 🌴](https://www.youtube.com/watch?v=HccklAXTlrE) | Art for Kids Hub | 5:56 |
| 10 | [How To Draw A Cherry Blossom Spring Tree](https://www.youtube.com/watch?v=88K3ytkQlek) | Art for Kids Hub | 6:21 |
| 11 | [How to Draw a Lily Flower Easy](https://www.youtube.com/watch?v=gmIYMCs-LGk) | Draw So Cute | 10:41 |
| 12 | [How to Draw a Flower Easy and Cute](https://www.youtube.com/watch?v=umpCpkxzpDc) | Draw So Cute | 6:38 |
| 13 | [How to Draw an Aloe Plant in a Pot 🌱— Cute Pun Art #4](https://www.youtube.com/watch?v=abj3jziG-2c) | Draw So Cute | 7:51 |
| 14 | [How to Draw a Rose step by step Easy](https://www.youtube.com/watch?v=kS80xQbLoH0) | Draw So Cute | 6:35 |
| 15 | [How To Draw Simple Lilies](https://www.youtube.com/watch?v=wLr8Kn9NqH4) | Art Hub Plus | 7:48 |
| 16 | [How To Draw A Peony Flower](https://www.youtube.com/watch?v=ozNI7LXpkxU) | Art for Kids Hub | 9:35 |
| 17 | [How to Draw an Orchid Flower Easy](https://www.youtube.com/watch?v=55FhQH0jMaY) | Draw So Cute | 11:17 |
| 18 | [How to Draw a Hydrangea Flower Easy](https://www.youtube.com/watch?v=EoY7g-P-aDc) | Draw So Cute | 14:04 |

## Animals and insects (27)

| # | Approved tutorial | Creator | Length |
| --- | --- | --- | --- |
| 19 | [How To Draw A Baby Axolotl](https://www.youtube.com/watch?v=2iF-9DAqYu8) | Art for Kids Hub | 4:54 |
| 20 | [How To Draw A Dachshund](https://www.youtube.com/watch?v=j7CjkMtWJrw) | Art for Kids Hub | 6:42 |
| 21 | [How To Draw A Cartoon Baby Chick](https://www.youtube.com/watch?v=5GOFwmqQ7oU) | Art for Kids Hub | 3:36 |
| 22 | [How To Draw A Cartoon Dolphin](https://www.youtube.com/watch?v=ou7NitF6gkU) | Art for Kids Hub | 6:22 |
| 23 | [How To Draw A Cartoon Turtle](https://www.youtube.com/watch?v=fGqtZbdjhNU) | Art for Kids Hub | 9:21 |
| 24 | [How To Draw The Cutest Puppy](https://www.youtube.com/watch?v=re4aKD1mHAg) | Art for Kids Hub | 5:44 |
| 25 | [How To Draw A Sleeping Black Cat](https://www.youtube.com/watch?v=M0qfztDSL3I) | Art for Kids Hub | 4:57 |
| 26 | [How To Draw A Great White Shark](https://www.youtube.com/watch?v=XbmCDPn_HuM) | Art for Kids Hub | 6:09 |
| 27 | [How to Draw a Bunny Easy 🌸🐰 Spring](https://www.youtube.com/watch?v=53rZ7cOroKM) | Draw So Cute | 7:29 |
| 28 | [How to Draw a Duck Super Easy and Cute](https://www.youtube.com/watch?v=ReQT_be_SoU) | Draw So Cute | 5:27 |
| 29 | [How to Draw a Highland Cow](https://www.youtube.com/watch?v=JVze438WC1Q) | Draw So Cute | 12:18 |
| 30 | [How to Draw a Husky Puppy Easy](https://www.youtube.com/watch?v=69TL8p8Qdts) | Draw So Cute | 10:36 |
| 31 | [How to Draw a Cheetah Easy — Cute Cartoon Animal](https://www.youtube.com/watch?v=6foVH8tbOEc) | Draw So Cute | 10:32 |
| 32 | [How to Draw an Arctic Fox Easy](https://www.youtube.com/watch?v=CYcIMHepH60) | Draw So Cute | 11:08 |
| 33 | [How to Draw a Hamster Drinking Boba Slush Drink 🧋🐹](https://www.youtube.com/watch?v=99qBQKSB7i8) | Draw So Cute | 11:34 |
| 34 | [How To Draw A Lion - Letter L - Preschool](https://www.youtube.com/watch?v=Ie-fgG2QOKs) | Art for Kids Hub | 5:47 |
| 35 | [How To Draw A Panda - Preschool](https://www.youtube.com/watch?v=OFvmH70UsCA) | Art for Kids Hub | 5:15 |
| 36 | [How To Draw A Grasshopper - Preschool](https://www.youtube.com/watch?v=nNc9vMQc3dc) | Art for Kids Hub | 5:08 |
| 37 | [How To Draw A Caterpillar](https://www.youtube.com/watch?v=3gzTJxjRCG0) | Art for Kids Hub | 11:05 |
| 38 | [How To Draw An Ant (Young Artists)](https://www.youtube.com/watch?v=3AYB6JNHM0c) | Art for Kids Hub | 6:45 |
| 39 | [How To Draw A Cartoon Ladybug](https://www.youtube.com/watch?v=ho29DN263QM) | Art for Kids Hub | 4:37 |
| 40 | [How to Draw a Penguin — Animals Drawings Easy Step-by-Step Tutorial!](https://www.youtube.com/watch?v=eEenczJV_l8) | Mister Brush | 2:39 |
| 41 | [How to Draw a Bird — Super Easy Step-by-Step Tutorial!](https://www.youtube.com/watch?v=1j5EO59Rhq4) | Mister Brush | 2:23 |
| 42 | [How to Draw a Bear Easy — Animals Drawings for Beginners](https://www.youtube.com/watch?v=G4Xlglmlpdg) | Mister Brush | 2:15 |
| 43 | [How to draw a Fish Step by Step — Drawings Tutorials for Kids](https://www.youtube.com/watch?v=QtGeB5tu2xU) | DrawinGeek | 2:18 |
| 44 | [How to Draw a Horse](https://www.youtube.com/watch?v=tQNbRUuzLXw) | Draw So Cute | 9:38 |
| 45 | [How To Draw A Cool Bald Eagle](https://www.youtube.com/watch?v=IubXiox8KSQ) | Art for Kids Hub | 7:07 |

## Food and drink (14)

| # | Approved tutorial | Creator | Length |
| --- | --- | --- | --- |
| 46 | [How To Draw A Cute Ice Cream Cone](https://www.youtube.com/watch?v=UW6H5dAPuhY) | Art for Kids Hub | 3:33 |
| 47 | [How to Draw a Birthday Cupcake Easy](https://www.youtube.com/watch?v=7coSy4lzav4) | Draw So Cute | 8:14 |
| 48 | [How to Draw a Bowl of Fruit Easy](https://www.youtube.com/watch?v=9QaO7H-3ZbM) | Draw So Cute | 10:57 |
| 49 | [How to Draw a Peach Easy and Cute — Cartoon Fruit](https://www.youtube.com/watch?v=66yTF6Udkt4) | Draw So Cute | 5:34 |
| 50 | [How to Draw a Pineapple Easy 🍍 Cute Fruit Art](https://www.youtube.com/watch?v=m6tRM1uBhTU) | Draw So Cute | 6:59 |
| 51 | [How to Draw Grapes Easy 🍇 Cute Fruit Pun Art](https://www.youtube.com/watch?v=Y8xSRhgxyLo) | Draw So Cute | 10:23 |
| 52 | [How to Draw a Lemon 🍋 Cute Fruit Pun Art](https://www.youtube.com/watch?v=Gn3IdOuUsMk) | Draw So Cute | 7:07 |
| 53 | [How to Draw a Banana Easy 🍌Cute Fruit Art](https://www.youtube.com/watch?v=90CaHw6HAsQ) | Draw So Cute | 5:14 |
| 54 | [How to Draw a Strawberry Easy - Cute Fruit](https://www.youtube.com/watch?v=6kIWWLZql3c) | Draw So Cute | 9:09 |
| 55 | [How to Draw a Rainbow Fruit Smoothie 🍓 Cute Drink Art](https://www.youtube.com/watch?v=PTOG4KLGi-k) | Draw So Cute | 9:03 |
| 56 | [How to Draw a Watermelon Slice 🍉Cute Pun Art #2](https://www.youtube.com/watch?v=f8cWZvMjMrI) | Draw So Cute | 6:53 |
| 57 | [How to Draw a Mango 🥭 Cute Fruit Pun Art](https://www.youtube.com/watch?v=zoVuOnfADNU) | Draw So Cute | 9:13 |
| 58 | [How To Draw Pizza - Preschool](https://www.youtube.com/watch?v=1gTJQOChf94) | Art for Kids Hub | 9:23 |
| 59 | [How to draw a Cup of Coffee — Coffee Cup Easy Draw Tutorial](https://www.youtube.com/watch?v=X-5TV2X2eMw) | DrawinGeek | 1:02 |

## Everyday objects and sport (15)

| # | Approved tutorial | Creator | Length |
| --- | --- | --- | --- |
| 60 | [How to Draw a Laptop Computer Easy and Cute](https://www.youtube.com/watch?v=Ysz-gkTATg8) | Draw So Cute | 6:44 |
| 61 | [How to Draw a Backpack Cute and Easy — Back to School Supplies](https://www.youtube.com/watch?v=i6z5ySP6-rg) | Draw So Cute | 8:49 |
| 62 | [How to Draw a Book Easy — Cute Back to School Supplies](https://www.youtube.com/watch?v=JuetpYnQwbg) | Draw So Cute | 6:46 |
| 63 | [How to Draw a Bookmark Easy  — Cute Back to School Supplies](https://www.youtube.com/watch?v=5HHB1X0i1FQ) | Draw So Cute | 7:15 |
| 64 | [How to Draw School Supplies — I ❤️ School Art](https://www.youtube.com/watch?v=kKHrRQ1KUtc) | Draw So Cute | 9:59 |
| 65 | [How To Draw A Funny School Notebook](https://www.youtube.com/watch?v=DcHWr651ddA) | Art for Kids Hub | 8:22 |
| 66 | [HOW TO DRAW A DIAMOND STEP BY STEP : EASY DRAWING TUTORIAL - By Rizzo Chris](https://www.youtube.com/watch?v=lqNzTm2q2N4) | Happy Drawings | 4:04 |
| 67 | [How to draw a Fishing Rod Step by Step — Easy drawings](https://www.youtube.com/watch?v=77Gyjq5hx-Y) | DrawinGeek | 1:13 |
| 68 | [How To Draw A Basketball   For Young Artists!](https://www.youtube.com/watch?v=tJu0A42Xk_I) | Art for Kids Hub | 3:51 |
| 69 | [How To Draw A Soccer Ball](https://www.youtube.com/watch?v=_vqnIBPk9fU) | Art for Kids Hub | 7:38 |
| 70 | [How To Draw A Gold Medal](https://www.youtube.com/watch?v=X_kxH8ukVCM) | Art for Kids Hub | 5:23 |
| 71 | [How To Draw A Tennis Racket And Ball](https://www.youtube.com/watch?v=s_2d0N9u2rA) | Art for Kids Hub | 7:47 |
| 72 | [How To Draw A Funny Bowling Ball And Pin](https://www.youtube.com/watch?v=PGwTPsyyS9M) | Art for Kids Hub | 8:47 |
| 73 | [How To Draw A Kite](https://www.youtube.com/watch?v=pLVxc-_XX2I) | Art for Kids Hub | 5:07 |
| 74 | [How to Draw Umbrella — Super Easy Stuff Drawing — Step-by-Step Tutorial!](https://www.youtube.com/watch?v=QjZFHR8EQrc) | Mister Brush | 1:46 |

## Vehicles and buildings (14)

| # | Approved tutorial | Creator | Length |
| --- | --- | --- | --- |
| 75 | [How To Draw A Toy Car](https://www.youtube.com/watch?v=cW_FxzH8pc4) | Art for Kids Hub | 5:10 |
| 76 | [How To Draw A Race Car (For Young Artists)](https://www.youtube.com/watch?v=MuB9ZP8QtEU) | Art for Kids Hub | 9:10 |
| 77 | [How To Draw An Airplane](https://www.youtube.com/watch?v=Pf6p2WsI83M) | Art for Kids Hub | 8:26 |
| 78 | [How To Draw A Train](https://www.youtube.com/watch?v=SOc3238Z3vM) | Art for Kids Hub | 12:47 |
| 79 | [How To Draw A Cruise Ship](https://www.youtube.com/watch?v=PJRwU9ODlVc) | Art for Kids Hub | 5:35 |
| 80 | [How To Draw A Double Decker Bus](https://www.youtube.com/watch?v=P1qqxWUSjVY) | Art for Kids Hub | 10:24 |
| 81 | [How To Draw A Submarine (For Young Artists)](https://www.youtube.com/watch?v=v5IvT8eNqao) | Art for Kids Hub | 10:44 |
| 82 | [How to Draw a Moped — Easy Vehicle Step-by-Step Tutorial!](https://www.youtube.com/watch?v=AWQaqQz4Tg0) | Mister Brush | 3:20 |
| 83 | [How to Draw a Rocket Cartoon drawings for kids step by step super easy](https://www.youtube.com/watch?v=zhrUVnW_jp4) | Mister Brush | 1:34 |
| 84 | [How to Draw a Car  — Super Easy Step-by-Step Tutorial!](https://www.youtube.com/watch?v=pYeDfMyBPEI) | Mister Brush | 2:07 |
| 85 | [How To Draw A Treehouse - Preschool](https://www.youtube.com/watch?v=HtBiY_ihVCA) | Art for Kids Hub | 6:18 |
| 86 | [How To Draw A Cozy Fall Cabin](https://www.youtube.com/watch?v=ikqkCEdcr8k) | Art for Kids Hub | 8:30 |
| 87 | [Easy HOUSE Drawing for Kids! Step by Step Lessons](https://www.youtube.com/watch?v=OBqtEVGDMGE) | Easy Kids Drawings | 4:48 |
| 88 | [How To Draw A Gingerbread House](https://www.youtube.com/watch?v=xEROfbsXEOY) | Art for Kids Hub | 8:16 |

## Sky and weather (4)

| # | Approved tutorial | Creator | Length |
| --- | --- | --- | --- |
| 89 | [How to Draw a Rainbow and Clouds Easy with Coloring](https://www.youtube.com/watch?v=Dt4SD4e2Z6E) | Draw So Cute | 9:07 |
| 90 | [How To Draw A Rain Cloud + Spotlight](https://www.youtube.com/watch?v=a3P3kHoLvAY) | Art for Kids Hub | 5:28 |
| 91 | [How to Draw a Colorful Rainbow for Kids — Draw Along with Bri Reads](https://www.youtube.com/watch?v=sYyb95LRTM4) | Bri Reads | 9:24 |
| 92 | [How To Draw A Rainbow 🌈 Drawings and Coloring for Kids](https://www.youtube.com/watch?v=B2lpZWGGjz0) | Super Easy Drawings | 2:54 |

## Approved tagging and selection implementation

1. Add a dedicated `drawingKind: 'character' | 'generic'` field to drawing entries in the `Video` model. Require complete tagging through a validation check; do not infer character/generic from a channel or from `franchise`. Keep `franchise` for its existing variety function and use Plants, Animals, Food, Objects, Vehicles, Buildings and Weather as generic theme values. Normalize `subject` on every drawing entry so alternate tutorials about the same subject cannot appear together.
2. Audit the existing 92 rather than tagging all of them as characters. The current catalogue includes eight unnamed mythical subjects (`drawing-82` through `drawing-89`: kitten dragon, ice dragon, Chinese dragon, griffin, phoenix, alicorn, fall fairy, dragon) and one ordinary T-rex (`drawing-92`). Proposed classification: those nine are generic; the other 83 are character tutorials. With these 92 additions, the library would contain **83 character / 101 generic**, while each displayed selection remains equal. The existing difficult generic lessons remain unchanged; this request has not authorized removing them.
3. Retain the current **12 displayed tutorials** and the existing **twice-daily refresh** (morning/evening `halfDaySeed`). Every selection must contain **exactly six character and six generic** videos, so the balance also holds across a day. The request says “daily”; retaining two refreshes avoids silently removing existing behavior. A change to one stable calendar-day set can be made separately if desired.
4. Extend selection with explicit six-per-kind quotas. Shuffle deterministically from the existing seed, draw from both tagged pools, keep shared channel/theme/subject counts across the entire 12, and shuffle the final 12 deterministically. Do not independently call the existing picker twice: that would allow the combined result to exceed global channel caps or repeat subjects.
5. Prefer the existing global maximum of three per creator and three per theme. If a greedy choice blocks completion, retry or backtrack deterministically before relaxing soft creator/theme limits. **Never relax the 6/6 quota or subject uniqueness to fill the list.** The current `pickRotation` relaxes constraints up to infinity, so its fallback must not be reused unchanged for balanced drawing selection. Exact video IDs must also be unique.
6. If fewer than six distinct usable subjects remain in either kind, return a smaller balanced set with `2 × min(6, available character subjects, available generic subjects)` entries. Keep the ratio, surface a catalogue validation failure to the maintainer, and do not substitute extra videos of the other kind. Maintain a checked fallback set if production requires a fixed 12.
7. Preserve the explicit `VIDEOS_ALL` browsing override as a full-library view; the balance rule applies to normal rotating selections, shuffle, and past/future selection overrides. Normal refresh and reset must restore the balanced selection. Watercolour, yoga and songs remain on their existing logic.
8. Extend `scripts/utils/check-drawing-rotation.ts`: require six of each kind for normal 12-item selections; same-seed stability; no duplicate IDs or subjects; global caps when feasible; AM/PM variation; balanced fallback with scarce or missing pools; complete tags; override behavior; and adequate coverage across at least 40 half-days. Verify the existing non-drawing rotation remains unchanged. Check displayed badges only if a visible kind label is added; the dedicated tag itself can remain internal.

## Approval and application record

The user approved the complete list and requested that everything be pushed. All 92 linked candidates have been added as `drawing-93` through `drawing-184`. All 184 drawing entries have explicit `drawingKind` and normalized `subject` tags, including the nine existing generic tutorials described above. Catalogue totals: **83 character / 101 generic**.

Balanced selection is implemented with deterministic backtracking, shared creator/theme limits, hard kind quotas and unique subjects. Forty half-days and scarce-pool/override cases passed; the watercolour regression check passed across 180 half-days. The approval hold is lifted; no additional video approval is pending. Existing thumbnail URLs are used directly; no thumbnail files were downloaded.
