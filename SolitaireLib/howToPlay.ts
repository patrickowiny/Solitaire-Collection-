export function getHowToPlay(gameId: string): string {
    const id = gameId.toLowerCase();

    // Map of specific instructions for well-known games and their variants to match user expectations
    const specificGuides: Record<string, string> = {
        klondike_draw_1_easy: `
            <p><strong>Overview:</strong> Klondike Draw 1 (Easy) is a relaxed version of the classic Solitaire. You draw cards one by one from the stock, and you have unlimited restocks of the deck, making it highly winnable.</p>
            <p><strong>Rules:</strong>
                <ul>
                    <li>Build tableau columns down in alternating colors (e.g., Red 7 on Black 8).</li>
                    <li>Move a single card or any valid alternating sequence between tableau columns.</li>
                    <li>Only Kings can fill empty tableau columns.</li>
                    <li>Unlimited passes through the stock, drawing 1 card at a time.</li>
                </ul>
            </p>
        `,
        klondike_draw_1_hard: `
            <p><strong>Overview:</strong> Klondike Draw 1 (Hard) is a strict single-draw game. You draw cards one by one, but you are allowed zero restocks (only 1 pass through the deck), requiring perfect foresight.</p>
            <p><strong>Rules:</strong>
                <ul>
                    <li>Build tableau columns down in alternating colors.</li>
                    <li>Only Kings can fill empty columns.</li>
                    <li>Only a single pass through the stock, drawing 1 card at a time. No recycling!</li>
                </ul>
            </p>
        `,
        klondike_draw_3_easy: `
            <p><strong>Overview:</strong> Klondike Draw 3 (Easy) draws cards in groups of three to the waste pile, but allows unlimited restocks of the stock deck.</p>
            <p><strong>Rules:</strong>
                <ul>
                    <li>Build tableau columns down in alternating colors.</li>
                    <li>Draw 3 cards at a time from the stock. Only the top card of the waste pile is playable.</li>
                    <li>Unlimited passes through the stock.</li>
                </ul>
            </p>
        `,
        klondike_draw_3_hard: `
            <p><strong>Overview:</strong> Klondike Draw 3 (Hard) is the classic casino Solitaire rule set. You draw 3 cards at a time and are allowed only 1 restock (2 passes total) of the deck.</p>
            <p><strong>Rules:</strong>
                <ul>
                    <li>Draw 3 cards at a time to the waste pile.</li>
                    <li>Exactly 1 restock allowed. Once the stock is depleted twice, the game is set.</li>
                </ul>
            </p>
        `,
        klondike_draw_2: `
            <p><strong>Overview:</strong> Klondike Draw 2 is an interesting middle-ground variant where you draw 2 cards at a time from the stock, with unlimited restocks allowed.</p>
        `,
        klondike_draw_4: `
            <p><strong>Overview:</strong> Klondike Draw 4 is a challenging variant where you draw 4 cards at a time from the stock, which can easily bury the cards you need deep in the waste pile.</p>
        `,
        klondike_draw_5: `
            <p><strong>Overview:</strong> Klondike Draw 5 is an extreme Klondike variant where you draw 5 cards at a time from the stock. This requires deep strategic planning to uncover hidden moves.</p>
        `,
        klondike_d3_strict: `
            <p><strong>Overview:</strong> Klondike Draw 3 (Strict) is the ultimate test of Klondike skill. You draw 3 cards at a time and have zero restocks allowed (only 1 pass through the deck).</p>
        `,
        whitehead: `
            <p><strong>Overview:</strong> Whitehead is a classic and highly strategic Klondike variant where all cards are dealt face-up, removing the element of luck from the tableau.</p>
            <p><strong>Unique Rules:</strong>
                <ul>
                    <li><strong>All Face-Up:</strong> All cards in the tableau are dealt face-up at the start of the game.</li>
                    <li><strong>Same-Color Building:</strong> Tableau columns are built down in the <em>same color</em> (e.g., Red Queen on Red King, or Club 8 on Spade 9).</li>
                    <li><strong>Suit-Based Movement:</strong> A sequence of cards can only be moved together as a unit if they are in the <em>same suit</em> (e.g., Heart Jack, Heart 10, Heart 9).</li>
                    <li><strong>Empty Columns:</strong> Any card (not just a King) can fill an empty tableau column.</li>
                </ul>
            </p>
        `,
        alaska: `
            <p><strong>Overview:</strong> Alaska is an exciting Yukon variant that allows you to build columns both up and down in the same suit, making for incredibly dynamic sequences.</p>
            <p><strong>Unique Rules:</strong>
                <ul>
                    <li><strong>Up or Down:</strong> Tableau columns can be built <em>either up or down</em> in the same suit (e.g., you can play the 9 of Spades or the Jack of Spades on the 10 of Spades).</li>
                    <li><strong>Group Movement:</strong> Like Yukon, any face-up card can be dragged along with all cards on top of it, regardless of whether they are in sequence.</li>
                    <li><strong>Empty Columns:</strong> Only Kings can fill empty tableau columns.</li>
                </ul>
            </p>
        `,
        easthaven_draw_3: `
            <p><strong>Overview:</strong> Easthaven (Draw 3) combines Easthaven's tableau layout (7 columns of 3 cards each) with a Klondike-style Draw 3 waste pile mechanism.</p>
            <p><strong>Rules:</strong>
                <ul>
                    <li>The tableau is set up with 7 columns of 3 cards each (2 face-down, 1 face-up).</li>
                    <li>Instead of dealing to the tableau, clicking the stock draws 3 cards at a time to a waste pile.</li>
                    <li>Tableau columns are built down in alternating colors. Empty columns can only be filled by Kings.</li>
                </ul>
            </p>
        `,
        easthaven_draw_1_easy: `
            <p><strong>Overview:</strong> Easthaven Draw 1 (Easy) features a 7x3 tableau and uses a Klondike-style Draw 1 waste pile with unlimited restocks of the stock deck.</p>
        `,
        canfield_draw_1_hard: `
            <p><strong>Overview:</strong> Canfield (Draw 1, Hard) draws cards one by one from the stock, but allows zero restocks of the deck, making it incredibly tight and challenging.</p>
        `,
        canfield_draw_3_hard: `
            <p><strong>Overview:</strong> Canfield (Draw 3, Hard) draws cards 3 at a time from the stock, and allows only 1 restock (2 passes total) of the deck.</p>
        `,
        canfield_draw_1: `
            <p><strong>Overview:</strong> Canfield (Draw 1) is a strategic variant where you draw cards one by one from the stock, with unlimited restocks allowed.</p>
        `,
        canfield_draw_2: `
            <p><strong>Overview:</strong> Canfield (Draw 2) is a strategic variant where you draw cards two by two from the stock, with unlimited restocks allowed.</p>
        `,
        canfield_d1_strict: `
            <p><strong>Overview:</strong> Canfield Draw 1 (Strict) is a very difficult variant where you draw 1 card at a time and have zero restocks of the deck allowed.</p>
        `,
        josephine: `
            <p><strong>Overview:</strong> Josephine is a popular Forty Thieves variant that relaxes the movement rules, allowing same-suit sequences to be moved together.</p>
            <p><strong>Unique Rules:</strong>
                <ul>
                    <li>Tableau columns build down in the same suit (like Forty Thieves).</li>
                    <li>Unlike Forty Thieves, any correctly ordered sequence of cards in the <em>same suit</em> can be moved together as a unit.</li>
                </ul>
            </p>
        `,
        lucas: `
            <p><strong>Overview:</strong> Lucas is a historic Forty Thieves variant. All Aces are automatically extracted and dealt to the foundations first, and the remaining cards are dealt into 13 tableau columns of 3 cards each.</p>
            <p><strong>Unique Rules:</strong>
                <ul>
                    <li>All Aces start directly on foundations.</li>
                    <li>13 tableau columns of 3 cards each, all dealt face-up.</li>
                </ul>
            </p>
        `,
        maria: `
            <p><strong>Overview:</strong> Maria Solitaire is a Forty Thieves variant played with 9 tableau columns of 4 cards each. Fewer columns makes clearing spaces more difficult.</p>
        `,
        limited: `
            <p><strong>Overview:</strong> Limited Solitaire is a Forty Thieves variant with 12 tableau columns of 3 cards each, giving you more columns but fewer cards in each column initially.</p>
        `,
        streets: `
            <p><strong>Overview:</strong> Streets is a classic Forty Thieves variant where tableau columns build down in alternating colors instead of same suit, making building much easier.</p>
        `,
        rank_and_file: `
            <p><strong>Overview:</strong> Rank and File is an intriguing Forty Thieves variant where the bottom 3 cards of each column are dealt face-down, with only the top card dealt face-up.</p>
        `,
        number_ten: `
            <p><strong>Overview:</strong> Number Ten is a Forty Thieves variant with 10 columns. Each column is dealt 2 cards face down and 2 cards face up. Building in the tableau is down in alternating colors.</p>
        `,
        red_and_black: `
            <p><strong>Overview:</strong> Red and Black is a Forty Thieves variant where building in the tableau is down in alternating colors instead of same suit, allowing for longer builds.</p>
        `,
        emperor: `
            <p><strong>Overview:</strong> Emperor is a hybrid of Forty Thieves and Klondike. Each of the 10 columns is dealt 3 cards: 2 face-down, 1 face-up. Tableau columns build down in alternating colors.</p>
        `,
        ali_baba: `
            <p><strong>Overview:</strong> Ali Baba Solitaire is a highly winnable Forty Thieves variant with 10 columns of 4 cards each. Same-suit sequences of cards can be moved as a unit.</p>
        `,
        blockade: `
            <p><strong>Overview:</strong> Blockade is a unique and strategic Forty Thieves variant with 12 columns of 1 card each. Deals from stock deal 1 card face up to each column.</p>
            <p><strong>Unique Rules:</strong>
                <ul>
                    <li>12 tableau columns, initially empty or holding 1 card each.</li>
                    <li>Instead of drawing to a waste pile, clicking the stock deals 1 card face up to every column.</li>
                </ul>
            </p>
        `,
        busy_aces: `
            <p><strong>Overview:</strong> Busy Aces is a Forty Thieves variant with 12 tableau columns of only 1 card each, making the board extremely wide and empty columns frequent.</p>
        `,
        freecell_easy: `
            <p><strong>Overview:</strong> Freecell (Easy) has automatic moves to foundation boosted to 3, and automatic reveal enabled, helping you win games with ease.</p>
        `,
        freecell_hard: `
            <p><strong>Overview:</strong> Freecell (Hard) disables all automatic moves to foundations, forcing you to manually place every card and fully manage your board state.</p>
        `,
        freecell_d1: `
            <p><strong>Overview:</strong> Freecell (1 Cell) is an extremely challenging Freecell variant with only 1 temporary holding cell instead of the standard 4 cells.</p>
        `,
        freecell_d2: `
            <p><strong>Overview:</strong> Freecell (2 Cells) is a tight Freecell variant with only 2 temporary holding cells instead of 4.</p>
        `,
        freecell_d3: `
            <p><strong>Overview:</strong> Freecell (3 Cells) is a challenging Freecell variant with only 3 temporary holding cells instead of 4.</p>
        `,
        double_freecell: `
            <p><strong>Overview:</strong> Double Freecell is a huge double-deck Freecell game played with 2 standard decks (104 cards total) and 8 foundation piles.</p>
        `,
        triple_freecell: `
            <p><strong>Overview:</strong> Triple Freecell is a massive triple-deck Freecell game played with 3 standard decks (156 cards total) and 12 foundation piles.</p>
        `,
        forecell: `
            <p><strong>Overview:</strong> Forecell is a Freecell variant where empty tableau columns can only be filled by a King or a sequence starting with a King.</p>
        `,
        seven: `
            <p><strong>Overview:</strong> Seven Freecell is played with only 7 tableau columns instead of the standard 8, slightly tightening card distributions.</p>
        `,
        tuxedo: `
            <p><strong>Overview:</strong> Tuxedo is a Seahaven Towers variant that gives you maximum tactical freedom by allowing any card to fill empty tableau spaces.</p>
            <p><strong>Unique Rules:</strong>
                <ul>
                    <li>Build down in the same suit (standard Seahaven Towers building rules).</li>
                    <li>Unlike Seahaven Towers, empty tableau columns can be filled by <em>any card</em>, not just Kings!</li>
                </ul>
            </p>
        `,
        klondike: `
            <p><strong>Overview:</strong> Klondike is the most classic and popular Solitaire game. The goal is to build up the four foundations by suit from Ace to King.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 7 columns. The first column gets 1 card, the second 2, and so on, with only the top card face up.</li>
                    <li><strong>Stock:</strong> Remaining cards, used to draw.</li>
                    <li><strong>Waste:</strong> Where drawn cards are placed.</li>
                    <li><strong>Foundations:</strong> 4 piles, initially empty.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Tableau columns can be built down in alternating colors (e.g., Red Queen on Black King).</li>
                    <li>Only Kings (or sequences starting with a King) can be placed in empty tableau columns.</li>
                    <li>Top cards of columns, waste cards, and foundation cards are always playable.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Always try to reveal face-down cards in the tableau columns first before drawing from the stock.</p>
        `,
        canfield: `
            <p><strong>Overview:</strong> Canfield is a challenging and highly strategic solitaire game. The objective is to build all 52 cards on the four foundations from the starting base rank up to the rank one below it (wrapping from King to Ace).</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Reserve:</strong> A pile of 13 cards, with only the top card face up. This is the main source of cards to move.</li>
                    <li><strong>Tableau:</strong> 4 columns, each dealt 1 card face up initially.</li>
                    <li><strong>Foundations:</strong> 4 piles. The first card dealt to the first foundation establishes the "base rank" for this game. All other foundations must start with this same rank.</li>
                    <li><strong>Stock & Waste:</strong> The remaining cards are drawn in groups of 3 (or 1 depending on options).</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Tableau columns are built down in alternating colors, wrapping around from Ace to King if necessary.</li>
                    <li>Empty tableau spaces are automatically filled from the Reserve. If the Reserve is empty, any card can fill the space.</li>
                    <li>Foundations are built up in suit, wrapping from King to Ace.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Manage your reserve pile carefully. Since empty tableau spaces are filled from the reserve, keeping empty spaces open gives you more flexibility to move sequences.</p>
        `,
        freecell: `
            <p><strong>Overview:</strong> Freecell is a solitaire game where almost 100% of deals are winnable. The objective is to move all 52 cards to the four foundation piles, building up from Ace to King by suit.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 8 columns of cards, all dealt face up at the start.</li>
                    <li><strong>Free Cells:</strong> 4 open slots used as temporary holding areas for cards.</li>
                    <li><strong>Foundations:</strong> 4 piles, initially empty.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Any card can be placed in a free cell.</li>
                    <li>Tableau piles can be built down in alternating colors.</li>
                    <li>Empty tableau columns can be filled by any card or sequence.</li>
                    <li>The number of cards you can move at once depends on the number of empty free cells and empty tableau columns available.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Keep your free cells empty as much as possible. Having free cells empty increases your ability to move longer sequences of cards around.</p>
        `,
        spider: `
            <p><strong>Overview:</strong> Spider is a highly popular double-deck solitaire game. The objective is to assemble 8 full suit-sequences (King to Ace) in the tableau columns. Once a full sequence is made, it is moved to a foundation.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 10 columns of cards, with only the top card face up.</li>
                    <li><strong>Stock:</strong> Deals 10 cards face up (one to each column) when clicked.</li>
                    <li><strong>Foundations:</strong> 8 piles, initially empty.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Tableau columns can be built down regardless of suit (e.g., any 7 on any 8).</li>
                    <li>Only sequences of cards in the <em>same suit</em> can be moved together.</li>
                    <li>Empty columns can be filled by any card or valid sequence.</li>
                    <li>You can only deal from the stock if all tableau columns are filled.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Try to create empty columns early. Empty columns allow you to rearrange mixed suits back into same-suit sequences.</p>
        `,
        fortythieves: `
            <p><strong>Overview:</strong> Forty Thieves is a difficult and classic two-deck game. The goal is to build up the eight foundations by suit from Ace to King.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 10 columns of 4 cards each, all dealt face up.</li>
                    <li><strong>Stock:</strong> Cards drawn one by one.</li>
                    <li><strong>Waste:</strong> Holds drawn cards, only the top card is playable.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Tableau columns build down in the <em>same suit</em> (e.g., 9 of Hearts on 10 of Hearts).</li>
                    <li>Only the top card of a tableau column can be moved. Sequences cannot be moved as a group.</li>
                    <li>Empty tableau spaces can be filled by any card.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Empty spaces are valuable. Since you cannot move card sequences, use empty tableau spaces to temporarily hold cards while organizing your builds.</p>
        `,
        yukon: `
            <p><strong>Overview:</strong> Yukon is a fast-paced game related to Klondike. The objective is to build the four foundations up by suit from Ace to King.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 7 columns of cards. Unlike Klondike, all cards are dealt at the start and there is no stock pile.</li>
                    <li><strong>Foundations:</strong> 4 piles, initially empty.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Tableau columns build down in alternating colors.</li>
                    <li>Crucially, <em>any group of face-up cards</em> can be moved together, regardless of whether they are in sequence or not.</li>
                    <li>Empty tableau spaces can only be filled by a King.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Focus on exposing the face-down cards as quickly as possible. Since any card group can be moved, you have maximum freedom to access cards.</p>
        `,
        golf: `
            <p><strong>Overview:</strong> Golf is a quick, fun game with simple rules. The objective is to clear all cards from the tableau into the single waste/discard pile.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 7 columns of 5 cards each, all face up.</li>
                    <li><strong>Stock:</strong> Deals 1 card at a time to the waste pile.</li>
                    <li><strong>Waste:</strong> Single discard pile.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>You can move any exposed card from the tableau to the waste if it is exactly one rank higher or lower than the top card of the waste, regardless of suit.</li>
                    <li>In easy variants, you can build up or down on a King (A-K-Q). In hard variants, no cards can be placed on a King.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Look for long chain sequences (e.g., 3-4-5-6-5-4-3) in the tableau before drawing from the stock.</p>
        `,
        pyramid: `
            <p><strong>Overview:</strong> Pyramid is a popular mathematical solitaire game. The goal is to discard the entire pyramid of 28 cards by pairing cards that add up to 13.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Pyramid:</strong> A triangular shape of 28 cards.</li>
                    <li><strong>Stock & Waste:</strong> Used to draw cards and pair them with pyramid cards.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Cards can only be paired if they are fully uncovered.</li>
                    <li>Valid pairs: Aces (1) + Queens (12), Twos (2) + Jacks (11), Threes (3) + Tens (10), etc. Kings (13) can be discarded individually.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Always prioritize pairing cards within the pyramid over stock/waste cards whenever possible to uncover more of the pyramid.</p>
        `,
        tripeaks: `
            <p><strong>Overview:</strong> TriPeaks is an exciting arcade-style solitaire game. The goal is to clear all cards from three connected peaks into the waste pile.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Peaks:</strong> Three overlapping pyramids of cards.</li>
                    <li><strong>Waste:</strong> Discard pile built up or down.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>Uncovered cards can be moved to the waste pile if they are one rank higher or lower than the top card of the waste, regardless of suit.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Plan your moves to uncover cards at the base of the peaks, which opens up more possibilities for consecutive combos.</p>
        `,
        acesup: `
            <p><strong>Overview:</strong> Aces Up (or Idiot's Delight) is a fast, luck-based solitaire game. The goal is to discard all cards from the board, leaving only the four Aces.</p>
            <p><strong>Layout:</strong>
                <ul>
                    <li><strong>Tableau:</strong> 4 columns.</li>
                    <li><strong>Stock:</strong> Deals 1 card to each column.</li>
                </ul>
            </p>
            <p><strong>Valid Moves & Rules:</strong>
                <ul>
                    <li>If the top cards of two columns share the same suit, the card with the lower rank can be discarded (Aces are highest).</li>
                    <li>Empty columns can be filled by any card.</li>
                </ul>
            </p>
            <p><strong>Strategy:</strong> Try to clear out columns to create empty spaces. This allows you to move cards around and uncover blocked cards of higher ranks.</p>
        `
    };

    // Return the specific guide if found
    for (const key of Object.keys(specificGuides)) {
        if (id === key) {
            return specificGuides[key]!;
        }
    }

    // Secondary sub-string matching for fallback compatibility
    for (const key of Object.keys(specificGuides)) {
        if (id.includes(key)) {
            return specificGuides[key]!;
        }
    }

    // Default template for any other solitaire game
    return `
        <p><strong>Overview:</strong> Welcome to ${gameId.charAt(0).toUpperCase() + gameId.slice(1).replace(/_/g, " ")}! This is a unique and engaging solitaire variant. The primary objective of the game is to arrange all playing cards into their proper target piles (either foundations or specified sequences) according to the unique rules of this variant.</p>
        <p><strong>Layout:</strong>
            <ul>
                <li><strong>Tableau Columns:</strong> The primary playing field where cards are stored, moved, and built.</li>
                <li><strong>Foundations:</strong> Piles where cards are built up (usually from Ace to King) or in specified patterns.</li>
                <li><strong>Stock and Waste:</strong> Sources of extra cards used when moves in the tableau columns are exhausted.</li>
            </ul>
        </p>
        <p><strong>General Solitaire Rules:</strong>
            <ul>
                <li>Cards in the tableau are typically built down by rank, in alternating colors, same suit, or regardless of suit depending on this specific variant.</li>
                <li>Single cards or arranged sequences of cards can be dragged and dropped onto appropriate targets.</li>
                <li>Double-click cards to automatically send them to eligible foundation piles.</li>
                <li>Use the Undo and Redo buttons at the bottom to re-evaluate and optimize your moves.</li>
            </ul>
        </p>
        <p><strong>Strategy:</strong> Study the initial layout carefully. Focus on clearing out cards to expose face-down cards or create empty spaces, which are extremely valuable in almost all solitaire variants.</p>
    `;
}
