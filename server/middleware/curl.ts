import chalk from 'chalk';

function box(def: {
    title: string;
    text: string;
    footer?: [string, string];
    padding?: [number, number];
}) {
    const [LINE_WIDTH_PADDING, LINE_HEIGHT_PADDING] = def.padding ?? [0, 0];
    const lineHeight = def.text.split('\n').length;
    const lineWidth = def.text
        .split('\n')
        .reduce((agg, cur) => Math.max(agg, cur.length), 0);

    let rendered =
        chalk.dim(`${GLYPHS.BOX.ROUND.TOP_LEFT}${GLYPHS.BOX.ROUND.XEDGE}`) +
        chalk.reset(` ${def.title} `) +
        chalk.dim(
            `${GLYPHS.BOX.ROUND.XEDGE.repeat(lineWidth - def.title.length - 3 + LINE_WIDTH_PADDING * 2)}${GLYPHS.BOX.ROUND.TOP_RIGHT}\n`,
        );
    rendered += (
        chalk.dim(GLYPHS.BOX.ROUND.YEDGE) +
        `${' '.repeat(LINE_WIDTH_PADDING)}${' '.repeat(lineWidth)}${' '.repeat(LINE_WIDTH_PADDING)}` +
        chalk.dim(GLYPHS.BOX.ROUND.YEDGE) +
        '\n'
    ).repeat(LINE_HEIGHT_PADDING);

    for (const line of def.text.split('\n')) {
        const padding = lineWidth - line.length;
        rendered +=
            chalk.dim(GLYPHS.BOX.ROUND.YEDGE) +
            `${' '.repeat(LINE_WIDTH_PADDING)}${line}${' '.repeat(padding)}${' '.repeat(LINE_WIDTH_PADDING)}` +
            chalk.dim(GLYPHS.BOX.ROUND.YEDGE) +
            '\n';
    }

    rendered += (
        chalk.dim(GLYPHS.BOX.ROUND.YEDGE) +
        `${' '.repeat(LINE_WIDTH_PADDING)}${' '.repeat(lineWidth)}${' '.repeat(LINE_WIDTH_PADDING)}` +
        chalk.dim(GLYPHS.BOX.ROUND.YEDGE) +
        '\n'
    ).repeat(LINE_HEIGHT_PADDING);
    rendered += chalk.dim(
        `${GLYPHS.BOX.ROUND.BOTTOM_LEFT}${GLYPHS.BOX.ROUND.XEDGE.repeat(lineWidth + LINE_WIDTH_PADDING * 2)}${GLYPHS.BOX.ROUND.BOTTOM_RIGHT}`,
    );

    if (def.footer) {
        rendered += '\n\n';
        const [left, right] = def.footer;
        const padding = lineWidth - left.length - right.length;
        rendered += chalk.dim(
            `${' '.repeat(LINE_WIDTH_PADDING)} ${left}${' '.repeat(padding)}${right} ${' '.repeat(LINE_WIDTH_PADDING)}`,
        );
    }

    return rendered;
}

export default defineEventHandler(async (event) => {
    const userAgent = getRequestHeader(event, 'user-agent') || '';

    if (userAgent.startsWith('curl/')) {
        const path = event.path;

        if (path === '/') {
            setResponseHeader(
                event,
                'content-type',
                'text/plain; charset=utf-8',
            );
            let res = '\n';

            res += `\
  ░█░█░█▀▀░█░░░█░░░█▀█░░░░░░░▀█▀░▀░█▄█░░░▀▀█░█▀█░█▀▄░█▀█░█▀█
  ░█▀█░█▀▀░█░░░█░░░█░█░░░░░░░░█░░░░█░█░░░░░█░█▀█░█▀▄░█░█░█░█
  ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▄▀░░░░▀▀▀░░░▀░▀░░░▀▀░░▀░▀░▀░▀░▀▀▀░▀░▀\n`;
            res += '\n';
            res += box({
                title: 'About',
                text: `\
I left school, my job, and moved to Austin in 2022 to write code full time.
That was definitely one of the best and most life changing decisions I've ever made.
I've learned a lot since then and still have much more to learn.

These days I build things because I find joy in making something someone else really enjoys using.
I get excited about reaching a level of polish that users don't even notice.

In a time where code is cheap I pride myself in taste and execution.
The best sticking point — in my limited opinion so far — is the way using your product feels.
So I want everything I make to simply feel the best to use.

If you want to build something cool or connect hit me up
we'll grab a coffee or beer in you're in Austin! 🤠🦇

Also check out some of my work at https://jaron.sh`,

                footer: ['Austin, TX', 'yo@jp.wtf'],
                padding: [2, 1],
            });
            const padding = chalk.reset('  ');

            return (
                res
                    .split('\n')
                    .map((l) => padding + l)
                    .join('\n') + '\n'
            );
        }
    }
});

const GLYPHS = {
    BOX: {
        DEFAULT: {
            TOP_LEFT: '┌',
            TOP_RIGHT: '┐',
            BOTTOM_LEFT: '└',
            BOTTOM_RIGHT: '┘',
            XEDGE: '─',
            YEDGE: '│',
        },
        ROUND: {
            TOP_LEFT: '╭',
            TOP_RIGHT: '╮',
            BOTTOM_LEFT: '╰',
            BOTTOM_RIGHT: '╯',
            XEDGE: '─',
            YEDGE: '│',
        },
    },
};
