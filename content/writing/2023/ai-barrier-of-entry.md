---
title: AI and the Barrier of Entry
date: 2023-03-25T12:00:00.000Z
description: We are witnessing the next major wave of technological innovation. And it's never been easier to be a part of it.
---

To be fair the term itself, **AI**, has had its meaning stretched pretty thin in the last few years. :margin-note[(Artificial Intelligence. The label has been doing too much work.)] It's been used to describe everything from a simple chatbot to a self driving car. That use is extremely broad. It doesn't really describe the space we think of as "AI".

The term has become a misnomer. Right now it's not about intelligence, it's about automation. The AI that people are afraid of is not the AI we are building today. That is often considered **AGI**. :margin-note[(Artificial General Intelligence: the ability for a machine to learn and adapt to new situations. That implies some level of consciousness, and we are still a ways from it.)]

The models that are most prevalent today are **LLMs** (Large Language Models) and **Stable Diffusion**. I won't go into too much detail here, but the gist is that an LLM receives a text prompt and outputs new text. With Stable Diffusion you input a text prompt and it generates an image. Both are a system of weights that, based on the input, guess what the desired output is. They are quite literally trying to determine what next "token" is most statistically likely to be "correct". Correctness being whatever the model was trained on, and how it was trained.

> The AI doesn't actually understand what it is producing. It is just really good at approximating an answer.

In that way the AI we have today is more like a supercharged search engine. It has lots of indexed information and it is really good at compiling that into something cohesive. What is really game changing is how **easy** these tools are to use.

When **OpenAI** introduced **ChatGPT** they gave anyone who could read and write the ability to leverage these models. That meant that no matter your profession, education, or — at the moment — income, you could ask a question and get an extremely human-like, and often correct, response. Even as a web developer I've felt this ease of access enter the industry.

The motivator for this post was my first experience using AI in a project. At **[Edlink](https://ed.link)** we wanted to enable people to transform datasets in any way they could think of. The first iteration was allowing people to write a custom function in **JavaScript**. You knew what the inputs were and what the output needed to be. Whatever happened in between was up to you.

Revisiting that, we realized this is exactly what these LLMs are good at. So we set to work adding a no-code option. First the user sends us a prompt describing what they want updated, added, or deleted. Then we make a script with a boilerplate function, all the types from our data model, and a constructed prompt asking the model to modify the function to do what the user requested. This is simply an API request that returns a set of answers. We pick the best and insert it as if the user wrote the function.

Here is an example of making that request to OpenAI:

```javascript
axios.post('https://api.openai.com/v1/completions', {
    model: 'code-davinci-002',
    prompt: `function customFunction(data) {\n // ${prompt}\n`,
    suffix: '\nreturn data;\n}',
    temperature: 0.2,
    max_tokens: 512
});
```

And voila... you have a magic text box that you can give english instructions to do almost anything to your data.
