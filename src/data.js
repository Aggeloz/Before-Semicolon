'use strict';

var POST_TYPES = {
	YOUTUBE: 'youtube',
	GITHUB: 'github'
};

var posts = [{
	videoId: "XnndhSaszuY",
	title: "Search Field (animate search icon into text cursor) - UI [How To]",
	thumbnailPath: "",
	url: "https://youtu.be/XnndhSaszuY",
	description: "Learn how to make your search field magical by turning your search icon into a text cursor when the user clicks on the field.",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/XnndhSaszuY",
	githubCodeURL: null
}, {
	videoId: "o9M9GvwOSCk",
	title: "How to Query/Select DOM Element with vanilla javascript - (You Don't Need jQuery)",
	thumbnailPath: "",
	url: "https://youtu.be/o9M9GvwOSCk",
	description: "Learn how to query any dom element without needing the awesome jQuery DOM traversing tools.",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/o9M9GvwOSCk",
	githubCodeURL: null
}, {
	videoId: "xDFNvEwPYYY",
	title: "When to use HTML image tag vs CSS background image",
	thumbnailPath: "",
	url: "https://youtu.be/xDFNvEwPYYY",
	description: "A quick overview of the best practice when it comes to putting an image in your page",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/xDFNvEwPYYY",
	githubCodeURL: null
}, {
	videoId: "ysS1U1zzF6Y",
	title: "CSS Specificity - What style rules gets set?",
	thumbnailPath: "",
	url: "https://youtu.be/ysS1U1zzF6Y",
	description: "Learn all about CSS specificity",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/ysS1U1zzF6Y",
	githubCodeURL: null
}, {
	videoId: "WJ3lpPVyVUI",
	title: "Remove, Clone and Replace DOM Elements [ How To ]",
	thumbnailPath: "",
	url: "https://youtu.be/WJ3lpPVyVUI",
	description: "Learn how to remove, clone and replace dom elements with plain/vanilla javascript",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/WJ3lpPVyVUI",
	githubCodeURL: null
}, {
	videoId: "BRdq03yqDhY",
	title: "Select Elements Siblings [ How To ]",
	thumbnailPath: "",
	url: "https://youtu.be/BRdq03yqDhY",
	description: "Learn how to select DOM element siblings",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/BRdq03yqDhY",
	githubCodeURL: null
}, {
	videoId: "mXOGpcm19J8",
	title: "Select any DOM element and (Nodelist vs HTMLCollection) - [ How to ]",
	thumbnailPath: "",
	url: "https://youtu.be/mXOGpcm19J8",
	description: "Learn how to get element by ID, ClassName, Tag Name, name and by querying like css",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/mXOGpcm19J8",
	githubCodeURL: null
}, {
	videoId: "sILWThH3RnA",
	title: "Select, Remove, Replace and Clone DOM Elements with plain Javascript",
	thumbnailPath: "",
	url: "https://youtu.be/sILWThH3RnA",
	description: "Learn how to select remove replace or clone any element, any child node, parent node, any siblings node using plain Javascript.",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/sILWThH3RnA",
	githubCodeURL: null
}, {
	videoId: "swWeWesZVZU",
	title: "When to use Section vs Article vs Div in Html?",
	thumbnailPath: "",
	url: "https://youtu.be/swWeWesZVZU",
	description: "Learn about the semantics behind section article and div tags in HTML.",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/swWeWesZVZU",
	githubCodeURL: null
}, {
	videoId: "bpdn9bwC2_o",
	title: "Lossy vs Lossless",
	thumbnailPath: "",
	url: "https://youtu.be/bpdn9bwC2_o",
	description: "A quick overview of how lossy and lossless formats play a role in our daily tech use and what they are. The video is a simple, straight format explanation where lossy and lossless format can be found or created and used.",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/bpdn9bwC2_o",
	githubCodeURL: null
}, {
	videoId: "D0xKqLheNpc",
	title: "How to decide between quality and loading time of image on a website",
	thumbnailPath: "",
	url: "https://youtu.be/D0xKqLheNpc",
	description: "Quick overview of what is like to deal with image on a responsive design",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/D0xKqLheNpc",
	githubCodeURL: null
}, {
	videoId: "zny2DasAmq0",
	title: "Drop.js Library | Create Html Drop-down, Tool-tips and Pop-ups",
	thumbnailPath: "",
	url: "https://youtu.be/zny2DasAmq0",
	description: "Quick introduction to Drop.js library",
	type: POST_TYPES.YOUTUBE,
	youtubeVideoURL: "https://youtu.be/zny2DasAmq0",
	githubCodeURL: "https://github.com/ECorreia45/Correia_Elson_WIA_Presentation"
}, {
	videoId: null,
	title: "Twitch loading mockup",
	thumbnailPath: "./media/thumbnails/twitchLoading.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/twitchLoading/",
	description: "This is a simple Twitch loading animation mock-up done in pure css.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: null,
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/twitchLoading/"
}, {
	videoId: null,
	title: "Search Field - Icon into text cursor",
	thumbnailPath: "./media/thumbnails/searchField.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/searchField/",
	description: "This is a clever usage of the search icon in a search field that transitions into a text cursor on field focus.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: "https://youtu.be/XnndhSaszuY",
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/searchField/"
}, {
	videoId: null,
	title: "Tabs indicator (example 1)",
	thumbnailPath: "./media/thumbnails/tabsIndicator.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/tabsIndicator/",
	description: "These tabs take advantage of linear-gradient and play on rotation to give them the nice tab look and appear as if they were shrinking or growing when active and inactive.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: null,
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/tabsIndicator/"
}, {
	videoId: null,
	title: "Tabs indicator (example 2)",
	thumbnailPath: "./media/thumbnails/tabsIndicator2.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/tabsIndicator2/",
	description: "These tabs example uses same style of the example 1 but the tab indicator moves in the x-axis when tab is active while changing shape.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: null,
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/tabsIndicator2/"
}, {
	videoId: null,
	title: "Input label float",
	thumbnailPath: "./media/thumbnails/inputLabelUp.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/inputLabelUp/",
	description: "This is a clever usage of field and label. The label here moves above the field and stays there while the user interacts with the field.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: null,
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/inputLabelUp/"
}, {
	videoId: null,
	title: "DropDown CSS Only!",
	thumbnailPath: "./media/thumbnails/dropdown.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/dropdown/",
	description: "This drop-down is build on css only and registers toggle and selected item in the drop-down.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: null,
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/dropdown/"
}, {
	videoId: null,
	title: "Tooltip CSS Only!",
	thumbnailPath: "./media/thumbnails/tooltips.gif",
	url: "https://ecorreia45.github.io/Before-Semicolon/examples/tooltips/",
	description: "This is a tooltip example with very minimal html and simple css activated on hover and blur events.",
	type: POST_TYPES.GITHUB,
	youtubeVideoURL: null,
	githubCodeURL: "https://ecorreia45.github.io/Before-Semicolon/examples/tooltips/"
}];

posts.forEach(function (post, index) {
	post.id = index + 1; // avoid id of zero
});

window.posts = posts;
window.POST_TYPES = POST_TYPES;
//# sourceMappingURL=data.js.map