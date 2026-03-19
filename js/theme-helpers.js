import { pickRandom } from './data.js';

// Populate an element with themed content (image or emoji)
export function setObjectContent(el, theme, index) {
    if (theme && theme.useImages && theme.images) {
        const img = document.createElement('img');
        img.src = theme.images[index % theme.images.length];
        img.alt = '';
        img.className = 'theme-obj-img';
        el.appendChild(img);
    } else if (theme && theme.objects) {
        el.textContent = theme.objects[index % theme.objects.length];
    } else {
        el.textContent = '\uD83C\uDF4E';
    }
}

// Get emoji or small img HTML for inline use (e.g. inside choice buttons)
export function objectInlineHtml(theme, count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        if (theme && theme.useImages && theme.images) {
            html += `<img src="${theme.images[i % theme.images.length]}" alt="" class="theme-obj-img" style="width:36px;height:36px;"> `;
        } else if (theme && theme.objects) {
            html += theme.objects[i % theme.objects.length] + ' ';
        } else {
            html += '\uD83C\uDF4E ';
        }
    }
    return html;
}

// Pick a single random emoji from theme (for games that use one object type)
export function pickThemeEmoji(theme) {
    if (theme && theme.objects) {
        return pickRandom(theme.objects);
    }
    return '\uD83C\uDF4E';
}
