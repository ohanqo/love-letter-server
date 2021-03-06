import Card from "./Card";
import { injectable } from "inversify";
import PlayCardDto from "../../dtos/PlayCardDto";
import Player from "../Player";
import {
    baronEqualCard,
    baronLoose,
    defaultError,
} from "../../configs/gameevents.config";
import Chat from "../Chat";

@injectable()
export default class Baron extends Card {
    public name = "Baron";
    public value = 3;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Chat {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) => this.doBattle(player, target),
            onError: (message: Chat) => message,
        });
    }

    private doBattle(player: Player, target?: Player): Chat {
        const playerCard = player.cardsHand[0];
        const targetCard = target.cardsHand[0];

        if (playerCard && targetCard) {
            const playerValue = playerCard.value;
            const targetValue = targetCard.value;

            if (playerValue === targetValue) {
                return new Chat(
                    `${player.name}${baronEqualCard}${target.name}`,
                );
            } else if (playerValue > targetValue) {
                this.updateToLooseStatus(target);
                return new Chat(`${target.name}${baronLoose}${player.name}`);
            } else {
                this.updateToLooseStatus(player);
                return new Chat(`${player.name}${baronLoose}${target.name}`);
            }
        }

        return new Chat(defaultError);
    }
}
