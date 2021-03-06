import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { container } from "../../configs/inversify.config";
import typesConfig from "../../configs/types.config";
import CardService from "../../services/CardService";
import Princess from "./Princess";
import State from "../../store/State";
import { princessDiscard, princePlayed } from "../../configs/gameevents.config";
import Chat from "../Chat";

@injectable()
export default class Prince extends Card {
    public name = "Prince";
    public value = 5;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Chat {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) =>
                this.discardTargetCard(player, target),
            onError: (message: Chat) => message,
        });
    }

    private discardTargetCard(player: Player, target: Player): Chat {
        const card = target.cardsHand[0];
        const cardService = container.get<CardService>(typesConfig.CardService);

        cardService.useCard(target, card);

        if (card instanceof Princess) {
            this.updateToLooseStatus(target);
            return new Chat(`${target.name}${princessDiscard}`);
        } else {
            const pickedCard = cardService.pickCard();

            this.handleNewCardPick(target, pickedCard);
            return new Chat(
                `${player.name}${princePlayed}${target.name}: ${card.name}`,
            );
        }
    }

    private handleNewCardPick(target: Player, pickedCard: Card) {
        if (pickedCard) {
            target.cardsHand.push(pickedCard);
        } else {
            const state = container.get<State>(typesConfig.State);
            target.cardsHand.push(state.burnedCard);
        }
    }
}
