export function getHowToPlay(gameId: string): string {
    const id = gameId.toLowerCase();

    // Map of specific instructions for well-known games to match user expectations
    const specificGuides: Record<string, string> = {
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
