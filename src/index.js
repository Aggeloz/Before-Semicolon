'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// on document ready
{
	window.addEventListener('load', function () {
		var waitingView = document.getElementById('waiting-view');
		waitingView.classList.add('completed');
		waitingView.classList.add('hide');
		setTimeout(function () {
			waitingView.remove();
		}, 2050);
	}, false);

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
}

var setYoutubePlayer = function setYoutubePlayer(iFrameId, videoId) {
	var autoPlay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	var events = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	var _window$location = window.location,
	    protocol = _window$location.protocol,
	    host = _window$location.host;


	return new YT.Player(iFrameId, {
		videoId: videoId,
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
		events: events
	});
};

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

		var _slidesContainer$getB = slidesContainer.getBoundingClientRect(),
		    containerWidth = _slidesContainer$getB.width;

		var scrollLeftTo = slide.offsetLeft - (containerWidth - slide.offsetWidth) / 2;

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
		var _slide$getBoundingCli = slide.getBoundingClientRect(),
		    slideLeftOffset = _slide$getBoundingCli.left,
		    slideWidth = _slide$getBoundingCli.width;

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
			var _slide$getBoundingCli2 = slide.getBoundingClientRect(),
			    width = _slide$getBoundingCli2.width,
			    left = _slide$getBoundingCli2.left;

			slidesDistanceToCenter[index] = Math.abs(slidesContainerWidth / 2 - (left + width / 2));
		});

		var shortestDistance = Math.min.apply(Math, slidesDistanceToCenter);
		var shortestDistanceSlideIndex = slidesDistanceToCenter.indexOf(shortestDistance);

		return slidesInView[shortestDistanceSlideIndex];
	};

	var animateSlide = function animateSlide(slide, containerCenterPoint, containerWidth) {
		var slideTitle = slide.querySelector('h2');

		var _slide$getBoundingCli3 = slide.getBoundingClientRect(),
		    left = _slide$getBoundingCli3.left,
		    width = _slide$getBoundingCli3.width;
		// start growing when the center of the slide comes in view


		var slideOffsetLeft = left + width / 2;
		var offsetLeft = null;

		if (slideOffsetLeft > containerCenterPoint) {
			offsetLeft = Math.max(containerWidth - slideOffsetLeft, 0);
		} else if (slideOffsetLeft <= 0) {
			offsetLeft = 0;
		} else {
			offsetLeft = Math.max(slideOffsetLeft, 0);
		}

		// the max scale we want to add is 0.1 so we multiply offsetLeft by 0.1
		var offsetLeftPercentage = offsetLeft * 0.1 / containerCenterPoint;

		// multiplying offsetLeftPercentage by 10 will give opacity less or equal to 1
		var opacity = offsetLeftPercentage * 10;

		slide.style.transform = 'scale(' + (1 + offsetLeftPercentage) + ')';
		slide.style.opacity = Math.max(opacity, 0.25); // min opacity is 0.25
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

	var whenDoneScrolling = function whenDoneScrolling() {
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

		function centerClosestSlide() {
			centerSlideTimer = setTimeout(function () {
				var closestSlideToCenter = getClosestSlideToTheCenter();
				if (closestSlideToCenter !== centeredSlide) {
					centerSlide(closestSlideToCenter);
				}
			}, 500);
		}
	};

	var handleContainerScroll = function handleContainerScroll() {
		handleSlides();
		centeredSlide = null;

		window.clearTimeout(isScrollingTimer);
		window.clearTimeout(centerSlideTimer);

		isScrollingTimer = setTimeout(whenDoneScrolling, 100);
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

		var player = setYoutubePlayer(data.videoId, data.videoId, false, {
			onStateChange: function onStateChange(e) {
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
		allSlides = [].concat(_toConsumableArray(slidesContainer.children));
		handleSlides();
		centerSlide(allSlides[0]);
		// need this to set iFrame after all slides are appended on the real DOM
		dataList.forEach(function (data) {
			setYoutubeIFrame(data);
		});
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

	window.addEventListener('resize', function () {
		handleSlides();
	});

	if (youtubePosts.length) {
		init(youtubePosts);
	} else {
		videoSliderContainer.remove();
	}
};

// modal setup
var closeModal = function closeModal(e) {
	var closeButton = e.target;
	var element = document.getElementById('modal-base');

	var _element$getBoundingC = element.getBoundingClientRect(),
	    left = _element$getBoundingC.left,
	    top = _element$getBoundingC.top,
	    width = _element$getBoundingC.width,
	    height = _element$getBoundingC.height;

	var modal = document.getElementById('modal');
	var modalContent = document.querySelector('.modal-content');

	[closeButton, modalContent].forEach(function (el) {
		el.classList.add('go-away');
		setTimeout(function () {
			modal.classList.add('go-away');
			el.remove();
		}, 300);
	});

	modal.style.width = width + 'px';
	modal.style.height = height + 'px';
	modal.style.top = top + 'px';
	modal.style.left = left + 'px';

	setTimeout(function () {
		modal.remove();
		element.removeAttribute('id');
		element.removeAttribute('style');
	}, 600);
};

var getModalContent = function getModalContent(data) {
	var docFragment = document.createDocumentFragment();
	var closeModalButton = document.createElement('BUTTON');
	closeModalButton.setAttribute('type', 'button');
	closeModalButton.className = 'close-modal';
	closeModalButton.addEventListener('click', function (e) {
		window.requestAnimationFrame(function () {
			closeModal(e);
		});
	});

	var modalContent = document.createElement('DIV');
	modalContent.className = 'modal-content';

	var videoIFrameContainer = document.createElement('DIV');
	videoIFrameContainer.className = 'video-iFrame-container ' + (data.type === POST_TYPES.GITHUB ? 'github-preview' : '');

	if (data.type === POST_TYPES.YOUTUBE) {
		var modalYoutubeIFrame = document.createElement('DIV');
		modalYoutubeIFrame.className = 'content';
		modalYoutubeIFrame.id = 'modal-' + data.videoId;
		videoIFrameContainer.appendChild(modalYoutubeIFrame);
	}

	if (data.type === POST_TYPES.GITHUB) {
		var modalGithubIFrame = document.createElement('IFRAME');
		var title = document.createElement('H2');
		modalGithubIFrame.className = 'content';
		modalGithubIFrame.src = data.url;
		videoIFrameContainer.appendChild(modalGithubIFrame);
		title.textContent = data.title + " (play with it)";
		modalContent.appendChild(title);
	}

	modalContent.appendChild(videoIFrameContainer);

	if (data.githubCodeURL) {
		var githubLink = document.createElement('A');
		githubLink.className = 'github-link';
		githubLink.href = data.githubCodeURL;
		githubLink.target = '_blank';
		githubLink.textContent = 'View Code';
		modalContent.appendChild(githubLink);
	}

	if (data.youtubeVideoURL) {
		var youtubeLink = document.createElement('A');
		youtubeLink.className = 'youtube-link';
		youtubeLink.href = data.youtubeVideoURL;
		youtubeLink.target = '_blank';
		youtubeLink.textContent = 'Watch Video';
		modalContent.appendChild(youtubeLink);
	}

	docFragment.appendChild(closeModalButton);
	docFragment.appendChild(modalContent);

	return docFragment;
};

var previewMedia = function previewMedia(element, data) {
	var _element$getBoundingC2 = element.getBoundingClientRect(),
	    left = _element$getBoundingC2.left,
	    top = _element$getBoundingC2.top,
	    width = _element$getBoundingC2.width,
	    height = _element$getBoundingC2.height;

	var elementClone = element.cloneNode(true);
	element.id = 'modal-base';
	element.style.opacity = '.2';

	elementClone.id = 'modal';
	elementClone.style.background = 'rgba(40, 54, 74, 0.95)';
	elementClone.style.display = 'block';
	elementClone.style.position = 'fixed';
	elementClone.style.margin = '0px';
	elementClone.style.overflow = 'hidden';
	elementClone.style.borderRadius = '0px';
	elementClone.style.width = width + 'px';
	elementClone.style.height = height + 'px';
	elementClone.style.top = top + 'px';
	elementClone.style.left = left + 'px';
	elementClone.style.zIndex = '10';
	elementClone.style.transition = 'top .5s ease-in-out, ' + 'left .5s ease-in-out, ' + 'height .5s ease-in-out, ' + 'width .5s ease-in-out';
	document.querySelector('body').appendChild(elementClone);

	[].concat(_toConsumableArray(elementClone.children)).forEach(function (child) {
		child.classList.add('fade-out');
		setTimeout(function () {
			child.style.display = 'none';
		}, 300);
	});

	setTimeout(function () {
		elementClone.style.top = '0px';
		elementClone.style.left = '0px';
		elementClone.style.width = '100vw';
		elementClone.style.height = '100vh';
	}, 0);

	elementClone.appendChild(getModalContent(data));
	setYoutubePlayer('modal-' + data.videoId, data.videoId, true);
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
				window.requestAnimationFrame(function () {
					previewMedia(post, data);
				});
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
	var mainContent = document.querySelector('.main-content');
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
			mainContent.appendChild(searchResultsContainer);
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
			window.requestAnimationFrame(function () {
				previewMedia(resultPost, post);
			});
		});

		var title = document.createElement('H3');
		title.textContent = post.title;

		var description = document.createElement('P');
		description.textContent = post.description;

		resultPost.appendChild(title);
		resultPost.appendChild(description);

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
			clearSearchButton.classList.remove('clear');
			toggleResults(false);
		}
	});
}

// mobile menu setup
{
	var siteHeader = document.querySelector('header');
	var siteTitle = document.querySelector('h1');
	var nav = document.querySelector('nav');
	var mobileMenuToggle = document.querySelector('button.menu-toggle');
	var main = document.querySelector('main');
	var footer = document.querySelector('footer');

	var animating = false;

	var toggleHiddenMenu = function toggleHiddenMenu() {
		mobileMenuToggle.classList.toggle('active');
		siteHeader.classList.toggle('menu-active');
		nav.classList.toggle('active');
		footer.classList.add('menu-active');

		if (main.classList.contains('shrink')) {
			main.style.top = '0px';
			main.style.left = '0px';
			main.style.transform = 'scale(1)';
			main.onclick = null;

			setTimeout(function () {
				main.classList.remove('shrink');
				footer.classList.remove('menu-active');
				main.removeAttribute('style');
			}, 500);
		} else {
			main.style.position = 'fixed';
			main.style.top = '0px';
			main.style.left = '0px';
			main.style.width = '100vw';
			main.style.height = '100vh';
			main.style.zIndex = '1';

			setTimeout(function () {
				main.classList.add('shrink');
				main.style.transform = 'scale(0.70)';
				main.style.left = '-35vw';
			}, 0);
		}
	};

	mobileMenuToggle.addEventListener('click', function () {
		if (!main.onclick) {
			main.onclick = function () {
				window.requestAnimationFrame(toggleHiddenMenu);
			};
		}

		window.requestAnimationFrame(toggleHiddenMenu);
	});
}
//# sourceMappingURL=index.js.map