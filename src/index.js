'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// on document ready
{
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
		setTimeout(f, 1000 / 60);
	};

	//  t = current time
	//  b = start value
	//  c = change in value
	//  d = duration
	Math.easeInOutQuad = function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	};

	window.addEventListener("load", function () {
		console.log('--- ready', document.readyState);
		var waitingView = document.getElementById('waiting-view');
		waitingView.classList.add('fade-out');
		waitingView.classList.add('completed');
		setTimeout(function () {
			waitingView.remove();
		}, 350);
	}, false);
}

// setupSliders
// will be called when youtube api is ready
// since that check is done in the index.html, it is set as global function for easy access
window.setupSliders = function () {

	var videoSliderContainer = document.getElementById('video-slider');
	var youtubePosts = posts.filter(function (post) {
		return post.type === POST_TYPES.YOUTUBE;
	});
	var _window$YT$PlayerStat = window.YT.PlayerState,
	    PLAYING = _window$YT$PlayerStat.PLAYING,
	    BUFFERING = _window$YT$PlayerStat.BUFFERING,
	    CUED = _window$YT$PlayerStat.CUED,
	    PAUSED = _window$YT$PlayerStat.PAUSED,
	    UNSTARTED = _window$YT$PlayerStat.UNSTARTED;

	var players = [];

	var allSlides = [];
	var slideSideMargins = 80;
	var nextButton = null;
	var prevButton = null;
	var slidesContainer = null;
	var slidesContainerWidth = null;
	var currentPlayerPlaying = null;
	var centeredSlide = null;
	var isScrollingTimer = null;
	var centerSlideTimer = null;

	// aid/utility functions
	var pauseAllPlayers = function pauseAllPlayers() {
		var playerToSkip = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

		players.forEach(function (player) {
			// a here refers to the iFrame
			if (!playerToSkip || player.a.id !== playerToSkip.a.id) {
				player.pauseVideo();
			}
		});
	};

	var scrollSlidesContainer = function scrollSlidesContainer(to, duration) {
		var onDone = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


		var start = slidesContainer.scrollLeft,
		    change = to - start,
		    currentTime = 0,
		    increment = 20;

		var animateScroll = function animateScroll() {
			currentTime += increment;
			slidesContainer.scrollLeft = Math.easeInOutQuad(currentTime, start, change, duration);

			if (currentTime < duration) {
				setTimeout(function () {
					window.requestAnimationFrame(animateScroll);
				}, increment);
			} else if (onDone) {
				onDone();
			}
		};

		animateScroll();
	};

	var toggleNavButtonsAccordingToSlide = function toggleNavButtonsAccordingToSlide(slide) {
		var upComingSlideIndex = allSlides.indexOf(slide);
		var isLastSlide = upComingSlideIndex === allSlides.length - 1;
		var isFirstSlide = upComingSlideIndex === 0;

		nextButton.style.display = isLastSlide ? 'none' : '';
		prevButton.style.display = isFirstSlide ? 'none' : '';
	};

	var centerSlide = function centerSlide(slide) {
		var onDone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		toggleNavButtonsAccordingToSlide(slide);

		var _slide$getBoundingCli = slide.getBoundingClientRect(),
		    slideWidth = _slide$getBoundingCli.width;

		var _slidesContainer$getB = slidesContainer.getBoundingClientRect(),
		    containerWidth = _slidesContainer$getB.width;

		// center slide has 80px left and right we just want half of it


		var scrollLeftTo = slide.offsetLeft - (containerWidth - slideWidth) / 2 - 40;
		scrollSlidesContainer(scrollLeftTo, 400, function () {
			centeredSlide = slide;
			if (onDone) {
				onDone();
			}
		});
	};

	var isSlideAppearingOnTheLeft = function isSlideAppearingOnTheLeft(slideLeftOffset) {
		return slideLeftOffset <= slidesContainerWidth;
	};

	var isSlideInView = function isSlideInView(slide) {
		var _slide$getBoundingCli2 = slide.getBoundingClientRect(),
		    slideLeftOffset = _slide$getBoundingCli2.left,
		    slideWidth = _slide$getBoundingCli2.width;

		return (slideLeftOffset > 0 || slideLeftOffset + slideWidth > 0) && isSlideAppearingOnTheLeft(slideLeftOffset);
	};

	var getSlidesInView = function getSlidesInView() {
		var slidesInView = [];

		// using every makes sure the loop quits when no other element is appearing in view
		// it is not need to keep iterating over the list if the rest are not in view
		allSlides.every(function (slide) {
			// only push if the slide is still in view
			if (isSlideInView(slide)) {
				slidesInView.push(slide);
			}

			return isSlideAppearingOnTheLeft(slide.getBoundingClientRect().left);
		});

		return slidesInView;
	};

	var getClosestSlideToTheCenter = function getClosestSlideToTheCenter() {
		var slidesInView = getSlidesInView();
		var slidesDistanceToCenter = [];

		slidesInView.forEach(function (slide, index) {
			var _slide$getBoundingCli3 = slide.getBoundingClientRect(),
			    width = _slide$getBoundingCli3.width,
			    left = _slide$getBoundingCli3.left;

			slidesDistanceToCenter[index] = Math.abs(slidesContainerWidth / 2 - (left + width / 2));
		});

		var shortestDistance = Math.min.apply(Math, slidesDistanceToCenter);
		var shortestDistanceSlideIndex = slidesDistanceToCenter.indexOf(shortestDistance);

		return slidesInView[shortestDistanceSlideIndex];
	};

	var animateSlide = function animateSlide(slide, containerCenterPoint, containerWidth) {
		var slideTitle = slide.querySelector('h2');

		var _slide$getBoundingCli4 = slide.getBoundingClientRect(),
		    left = _slide$getBoundingCli4.left,
		    width = _slide$getBoundingCli4.width;
		// start growing when the center of the slide comes in view


		var slideOffsetLeft = left + width / 2;
		var location = null;

		if (slideOffsetLeft > containerCenterPoint) {
			location = Math.max(containerWidth - slideOffsetLeft, 0);
		} else if (slideOffsetLeft <= 0) {
			location = 0;
		} else {
			location = Math.max(slideOffsetLeft, 0);
		}

		// the max scale we want to add is 0.1 so we multiply location by 0.1
		var locationPercentage = location * 0.1 / containerCenterPoint;

		// multiplying locationPercentage by 800 will give margin less or equal to 80
		// slideSideMargins may consty but will always mean max margin
		var sideMargin = locationPercentage * (slideSideMargins * 10);
		// multiplying locationPercentage by 10 will give opacity less or equal to 1
		var opacity = locationPercentage * 10;

		slide.style.transform = 'scale(' + (1 + locationPercentage) + ')';
		slide.style.opacity = Math.max(opacity, 0.25); // min opacity is 0.25
		slide.style.marginLeft = Math.max(sideMargin, 25) + 'px'; // min margin is 25
		slide.style.marginRight = Math.max(sideMargin, 25) + 'px'; // min margin is 25
		slideTitle.style.opacity = opacity;
	};

	// eventListeners functions
	var handleSlides = function handleSlides() {
		slidesContainerWidth = slidesContainer.getBoundingClientRect().width;
		var slidesContainerCenterPoint = slidesContainerWidth / 2;
		var slidesInView = getSlidesInView(slidesContainerWidth);

		slidesInView.forEach(function (slide) {
			window.requestAnimationFrame(function () {
				animateSlide(slide, slidesContainerCenterPoint, slidesContainerWidth);
			});
		});
	};

	var handleContainerScroll = function handleContainerScroll() {
		centeredSlide = null;
		window.clearTimeout(isScrollingTimer);
		window.clearTimeout(centerSlideTimer);

		isScrollingTimer = setTimeout(function () {
			if (currentPlayerPlaying) {
				var playingSlide = currentPlayerPlaying.a.parentNode.parentNode;

				if (currentPlayerPlaying.getPlayerState() === PLAYING) {
					centerSlideTimer = setTimeout(function () {
						if (isSlideInView(playingSlide)) {
							centerSlide(playingSlide);
						} else {
							currentPlayerPlaying.pauseVideo();
							centerClosestSlide();
						}
					}, 1000);
				}
			} else {
				centerClosestSlide();
			}
		}, 66);

		function centerClosestSlide() {
			centerSlideTimer = setTimeout(function () {
				var closestSlideToCenter = getClosestSlideToTheCenter();
				if (closestSlideToCenter !== centeredSlide) {
					centerSlide(closestSlideToCenter);
				}
			}, 500);
		}

		handleSlides();
	};

	var navigateSlidesWithButton = function navigateSlidesWithButton(e) {
		var button = e.currentTarget;
		var isNextButton = button.className === 'next-slide';
		button.setAttribute('disabled', '');
		if (currentPlayerPlaying && currentPlayerPlaying.getPlayerState() === PLAYING) {
			currentPlayerPlaying.pauseVideo();
		}

		var currentSlide = centeredSlide || getClosestSlideToTheCenter();
		var upComingSlide = isNextButton ? currentSlide.nextElementSibling : currentSlide.previousElementSibling;

		if (upComingSlide) {
			centerSlide(upComingSlide, function () {
				button.removeAttribute('disabled');
			});
		}
	};

	// essential functions
	var setYoutubeIFrame = function setYoutubeIFrame(data) {
		var autoPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
		var _window$location = window.location,
		    protocol = _window$location.protocol,
		    host = _window$location.host;


		var player = new YT.Player(data.videoId, {
			videoId: data.videoId,
			host: 'http://www.youtube.com',
			playerVars: {
				fs: 1,
				autoplay: autoPlay ? 1 : 0,
				enablejsapi: 1,
				modestbranding: 1,
				rel: 0,
				showinfo: 0,
				origin: protocol + '//' + host
			},
			events: {
				'onReady': function onReady() {
					console.log('onReady');
				},
				'onStateChange': function onStateChange(e) {
					var slide = player.a.parentNode.parentNode;
					if (e.data === BUFFERING || e.data === PLAYING) {
						pauseAllPlayers(player);
						currentPlayerPlaying = player;
						if (!centeredSlide || centeredSlide !== slide) {
							centerSlide(slide);
						}
					} else if (e.data === PAUSED) {
						currentPlayerPlaying = null;
					}
				}
			}
		});

		players.push(player);
	};

	var populateSlides = function populateSlides(dataList, slidesContainer) {
		var docFragment = document.createDocumentFragment();

		var iFrameContainers = [];
		dataList.forEach(function (data) {
			var slide = document.createElement('SECTION');
			slide.className = 'slide';

			var slideTitle = document.createElement('H2');
			slideTitle.textContent = data.title;

			var iFrameContainer = document.createElement('DIV');
			var iFrame = document.createElement('DIV');
			iFrame.className = 'content';
			iFrame.id = data.videoId; // this is used to mark the div to be replaced by youtube api with iframe
			iFrameContainer.className = 'video-iFrame-container';
			iFrameContainer.appendChild(iFrame);
			iFrameContainers.push(iFrameContainer);

			slide.appendChild(iFrameContainer);
			slide.appendChild(slideTitle);
			docFragment.appendChild(slide);
		});

		slidesContainer.appendChild(docFragment);
		// need this to set iFrame after all slides are appended on the real DOM
		dataList.forEach(function (data) {
			setYoutubeIFrame(data);
		});
		allSlides = [].concat(_toConsumableArray(slidesContainer.children));
		handleSlides();
	};

	var init = function init(dataList) {
		var docFragment = document.createDocumentFragment();

		slidesContainer = document.createElement('DIV');
		slidesContainer.className = 'slides-container';
		slidesContainer.addEventListener('scroll', handleContainerScroll);

		var slidesNavButtons = document.createElement('DIV');
		slidesNavButtons.className = 'slider-nav-buttons';

		prevButton = document.createElement('BUTTON');
		prevButton.setAttribute('type', 'button');
		prevButton.className = 'prev-slide';
		prevButton.style.display = 'none';
		prevButton.textContent = 'prev';
		prevButton.addEventListener('click', navigateSlidesWithButton);

		nextButton = document.createElement('BUTTON');
		nextButton.setAttribute('type', 'button');
		nextButton.className = 'next-slide';
		nextButton.textContent = 'next';
		nextButton.addEventListener('click', navigateSlidesWithButton);

		slidesNavButtons.appendChild(prevButton);
		slidesNavButtons.appendChild(nextButton);

		docFragment.appendChild(slidesContainer);
		docFragment.appendChild(slidesNavButtons);

		videoSliderContainer.appendChild(docFragment);
		populateSlides(dataList, slidesContainer);
	};

	window.addEventListener('resize', handleSlides);

	if (youtubePosts.length) {
		init(youtubePosts);
	} else {
		videoSliderContainer.remove();
	}
};

var previewMedia = function previewMedia(element, data) {
	console.log('-- previewMedia', element, data);
};

// posts setup
{
	var uiExamplesContainer = document.getElementById('ui-examples');
	var githubPosts = posts.filter(function (post) {
		return post.type === POST_TYPES.GITHUB;
	});

	var populatePosts = function populatePosts(dataList) {
		var postsContainer = document.createElement('DIV');

		dataList.forEach(function (data) {
			var post = document.createElement('ARTICLE');
			post.className = 'post';
			post.addEventListener('click', function () {
				previewMedia(post, data);
			});

			var thumbnail = document.createElement('DIV');
			thumbnail.className = 'thumbnail';

			var img = document.createElement('IMG');
			img.src = data.thumbnailPath;
			img.alt = data.title;
			img.className = 'content';

			thumbnail.appendChild(img);

			var title = document.createElement('H3');
			title.textContent = data.title;

			post.appendChild(thumbnail);
			post.appendChild(title);

			postsContainer.appendChild(post);
		});

		uiExamplesContainer.appendChild(postsContainer);
	};

	if (githubPosts.length) {
		populatePosts(githubPosts);
	} else {
		uiExamplesContainer.remove();
	}
}

// search setup
{
	var searchResultsContainer = document.createElement('SECTION');
	searchResultsContainer.id = 'search-results';
	var searchResultsContainerTitle = document.createElement('H2');
	var searchForm = document.getElementById('search-form');
	var searchField = searchForm[0];
	var clearSearchButton = searchForm[1];
	var main = document.querySelector('main');
	var videoSlider = document.getElementById('video-slider');
	var uiExamples = document.getElementById('ui-examples');

	var searchTerm = '';
	var resultsCount = 0;
	var searchTimer = null;

	var toggleResults = function toggleResults() {
		var visible = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

		if (visible) {
			searchResultsContainer.style.display = '';
			videoSlider.classList.add('fade-out');
			uiExamples.classList.add('fade-out');
			setTimeout(function () {
				videoSlider.style.display = 'none';
				uiExamples.style.display = 'none';
			}, 300);
		} else {
			console.log('-- hide');
			searchResultsContainer.classList.add('fade-out');
			setTimeout(function () {
				videoSlider.style.display = '';
				uiExamples.style.display = '';
				searchResultsContainer.style.display = 'none';
				videoSlider.classList.remove('fade-out');
				uiExamples.classList.remove('fade-out');
			}, 300);
		}
	};

	var displayResults = function displayResults(results) {
		toggleResults();

		if (!document.getElementById('search-results')) {
			searchResultsContainerTitle.insertAdjacentHTML('afterbegin', '<b>' + resultsCount + '</b> results found for:<span>"' + searchTerm + '"</span>');
			searchResultsContainer.appendChild(searchResultsContainerTitle);
			searchResultsContainer.appendChild(document.createElement('DIV'));
			main.appendChild(searchResultsContainer);
		} else {
			searchResultsContainerTitle.children[0].textContent = '' + resultsCount;
			searchResultsContainerTitle.children[1].textContent = '"' + searchTerm + '"';
		}

		searchResultsContainer.lastElementChild.innerHTML = '';
		searchResultsContainer.lastElementChild.appendChild(results);
	};

	var getSearchResultPostElement = function getSearchResultPostElement(post) {

		var resultPost = document.createElement('DIV');
		resultPost.className = 'search-result ' + post.type;
		resultPost.addEventListener('click', function () {
			previewMedia(resultPost, post);
		});

		var title = document.createElement('H3');
		title.textContent = post.title;

		resultPost.appendChild(title);

		return resultPost;
	};

	var searchInPostsAndGetResults = function searchInPostsAndGetResults() {
		var terms = searchTerm.split(' ');
		var termsRegex = terms.map(function (term) {
			return new RegExp(term, 'gmi');
		});
		var results = [];

		posts.forEach(function (post) {
			termsRegex.forEach(function (term) {
				if (results.indexOf(post) < 0) {
					if (term.test(post.title)) {
						// things matching title are more relevant so should appear first
						results.unshift(post);
						++resultsCount;
					} else if (term.test(post.description)) {
						results.push(post);
						++resultsCount;
					}
				}
			});
		});

		return results;
	};

	searchForm.addEventListener('submit', function (e) {
		e.preventDefault();
	});

	searchField.addEventListener('input', function (e) {
		searchTerm = e.target.value.trim();
		resultsCount = 0;

		window.clearTimeout(searchTimer); // adds delay over typing

		if (searchTerm.length) {
			clearSearchButton.classList.add('clear');

			if (searchTerm.length >= 3) {
				searchTimer = setTimeout(function () {
					var resultsFragment = document.createDocumentFragment();
					var results = searchInPostsAndGetResults();

					results.forEach(function (res) {
						return resultsFragment.appendChild(getSearchResultPostElement(res));
					});

					if (resultsCount === 0) {
						var noResultMessage = document.createElement('P');
						noResultMessage.textContent = 'Nothing matched "' + searchTerm + '". If you think it doesn\'t exist yet, send a suggestion!';
						resultsFragment.appendChild(noResultMessage);
					}

					displayResults(resultsFragment);
				}, 500);
			}
		} else {
			clearSearchButton.classList.remove('clear');
		}
	});

	searchField.addEventListener('blur', function () {
		window.clearTimeout(searchTimer); // adds delay over typing

		if (!searchTerm) {
			searchTimer = setTimeout(function () {
				toggleResults(false);
			}, 300);
		}
	});

	clearSearchButton.addEventListener('click', function () {
		if (searchTerm) {
			searchField.value = '';
			toggleResults(false);
		}
	});
}
//# sourceMappingURL=index.js.map