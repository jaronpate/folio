import chalk from 'chalk';

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
            const padding = chalk.reset('    ');
            return (
                chalk.bgGray(`\

${padding}░█░█░█▀▀░█░░░█░░░█▀█░░░░░░░▀█▀░▀░█▄█░░░▀▀█░█▀█░█▀▄░█▀█░█▀█
${padding}░█▀█░█▀▀░█░░░█░░░█░█░░░░░░░░█░░░░█░█░░░░░█░█▀█░█▀▄░█░█░█░█
${padding}░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▄▀░░░░▀▀▀░░░▀░▀░░░▀▀░░▀░▀░▀░▀░▀▀▀░▀░▀
${padding}
${padding}┌ About ─────────────────────────────────────────────────────────────────────┐
${padding}│                                                                            │
${padding}│ I build things to solve problems from the ground up.                       │
${padding}│                                                                            │
${padding}│ I left school and my job at Chick-fil-A in 2022 to write code full time.   │
${padding}│ It's definitely one of the best decisions I've ever made.                  │
${padding}│ I've learned a lot since then and still have so much more to learn.        │
${padding}│                                                                            │
${padding}│ If you want to build something cool or connect hit me up                   │
${padding}│ we'll grab a coffee or beer in you're in Austin!                           │
${padding}│                                                                            │
${padding}└────────────────────────────────────────────────────────────────────────────┘
${padding}
${padding} Austin, TX                                                         yo@jp.wtf
`) + '\n'
            );
        }
    }
});
