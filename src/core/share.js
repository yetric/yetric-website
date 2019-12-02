import {triggerEvent} from './events';

export const supportsNativeShare = () => 'share' in navigator;
export const share = ({title, text, url}) => {
    if (navigator.share) {
        navigator
            .share({title, text, url})
            .then(() => {
                triggerEvent(document, 'sharedURL', {title, text, url});
            })
            .catch((error) => {
                console.error(error);
            });
    }
};
