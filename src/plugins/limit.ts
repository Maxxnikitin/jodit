/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License https://xdsoft.net/jodit/license.html
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */
import {Config} from '../Config';
import {Jodit} from "../Jodit";
import {Plugin} from "../../types/modules/Plugin";
import {IViewBased} from "../modules/view/type";
import {COMMAND_KEYS, INVISIBLE_SPACE_REG_EXP, SPACE_REG_EXP} from "../constants";
import {extractText} from "../modules/Helpers";


declare module "../Config" {
    interface Config {
        limitWords: false | number;
        limitChars: false | number;
        limitHTML: false;
    }
}

/**
 * @property {boolean | number} limitWords=false limit words count
 */

Config.prototype.limitWords = false;


/**
 * @property {boolean | number} limitChars=false limit chars count
 */
Config.prototype.limitChars = false;

/**
 * @property {boolean} limitHTML=false limit html chars count
 */
Config.prototype.limitHTML = false;


export function limit(jodit: Jodit) {
    if (jodit && (jodit.options.limitWords || jodit.options.limitChars)) {
        const callback = (event: KeyboardEvent | null, inputText: string = ''): void | boolean => {
            const text: string = inputText || (jodit.options.limitHTML ? jodit.value : jodit.getEditorText());

            const words: string[] = text
                                        .replace(INVISIBLE_SPACE_REG_EXP, '')
                                        .split(SPACE_REG_EXP)
                                        .filter((e: string) => e.length);

            if (event && COMMAND_KEYS.indexOf(event.which) !== -1) {
                return;
            }

            if (jodit.options.limitWords && jodit.options.limitWords <= words.length) {
                return jodit.options.limitWords === words.length;
            }

            if (jodit.options.limitChars && jodit.options.limitChars <= words.join('').length) {
                return jodit.options.limitChars === words.join('').length;
            }

            return;
        };

        jodit.events
            .on('keydown keyup beforeEnter', (event: KeyboardEvent): false | void => {
                if (callback(event) !== void(0)) {
                    return false;
                }
            })
            .on('change', (newValue: string, oldValue: string) => {
                if (callback(null, jodit.options.limitHTML ? newValue : extractText(newValue)) === false) {
                    jodit.value = oldValue;
                }
            });
    }
}
