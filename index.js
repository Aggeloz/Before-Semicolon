// on document ready
{
	window.requestAnimationFrame =
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (f) {
			setTimeout(f, 1000 / 60);
		};
	
	//  t = current time
	//  b = start value
	//  c = change in value
	//  d = duration
	Math.easeInOutQuad = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};
	
	window.addEventListener("load", () => {
		console.log('--- ready', document.readyState);
	}, false);
}

window.setupSliders = () => {
	
	const videoSliderContainer = document.getElementById('video-slider');
	const youtubePosts = posts.filter(post => post.type === 'youtube');
	const {PLAYING, BUFFERING, CUED, PAUSED, UNSTARTED} = window.YT.PlayerState;
	const players = [];
	
	let allSlides = [];
	let slideSideMargins = 80;
	let slidesContainer = null;
	let slidesContainerWidth = null;
	let currentPlayerPlaying = null;
	let centeredSlide = null;
	let isScrollingTimer = null;
	let centerSlideTimer = null;
	
	// aid/utility functions
	const pauseAllPlayers = (playerToSkip = null) => {
		players.forEach(player => {
			// a here refers to the iFrame
			if (!playerToSkip || player.a.id !== playerToSkip.a.id) {
				player.pauseVideo();
			}
		})
	}
	
	const scrollSlidesContainer = (to, duration, onDone = null) => {
		
		let start = slidesContainer.scrollLeft,
			change = to - start,
			currentTime = 0,
			increment = 20;
		
		const animateScroll = function(){
			currentTime += increment;
			slidesContainer.scrollLeft = Math.easeInOutQuad(currentTime, start, change, duration);
			
			if(currentTime < duration) {
				setTimeout(() => {
					window.requestAnimationFrame(animateScroll);
				}, increment);
			} else if (onDone){
				onDone();
			}
		};
		
		animateScroll();
	}
	
	const centerSlide = (slide, onDone = null) => {
		console.log('-- center slide');
		const {width: slideWidth} = slide.getBoundingClientRect();
		const {width: containerWidth} = slidesContainer.getBoundingClientRect();
		
		// center slide has 80px left and right we just want half of it
		const scrollLeftTo = slide.offsetLeft - ((containerWidth - slideWidth) / 2) - 40;
		scrollSlidesContainer(scrollLeftTo, 800, () => {
			centeredSlide = slide;
			if (onDone) {
				onDone();
			}
		});
	}
	
	const isSlideAppearingOnTheLeft = slideLeftOffset => {
		return slideLeftOffset <= slidesContainerWidth
	}
	
	const isSlideInView = slide => {
		const {left: slideLeftOffset, width: slideWidth} = slide.getBoundingClientRect();
		return ((slideLeftOffset > 0 || (slideLeftOffset + slideWidth) > 0) && isSlideAppearingOnTheLeft(slideLeftOffset))
	}
	
	const getSlidesInView = () => {
		const slidesInView = [];
		
		// using every makes sure the loop quits when no other element is appearing in view
		// it is not need to keep iterating over the list if the rest are not in view
		allSlides.every(slide => {
			// only push if the slide is still in view
			if (isSlideInView(slide)) {
				slidesInView.push(slide)
			}
			
			return isSlideAppearingOnTheLeft(slide.getBoundingClientRect().left);
		});
		
		return slidesInView;
	}
	
	const getClosestSlideToTheCenter = () => {
		const slidesInView = getSlidesInView();
		const slidesDistanceToCenter = [];
		
		slidesInView.forEach((slide, index) => {
			const {width, left} = slide.getBoundingClientRect();
			slidesDistanceToCenter[index] = Math.abs((slidesContainerWidth / 2) - (left + (width / 2)));
		});
		
		const shortestDistance = Math.min(...slidesDistanceToCenter);
		const shortestDistanceSlideIndex = slidesDistanceToCenter.indexOf(shortestDistance);
		
		return slidesInView[shortestDistanceSlideIndex];
	}
	
	const animateSlide = (slide, containerCenterPoint, containerWidth) => {
		const slideTitle = slide.querySelector('h2');
		const {left, width} = slide.getBoundingClientRect();
		// start growing when the center of the slide comes in view
		const slideOffsetLeft = left + (width / 2);
		let location = null;
		
		if (slideOffsetLeft > containerCenterPoint) {
			location = Math.max(containerWidth - slideOffsetLeft, 0);
		} else if (slideOffsetLeft <= 0) {
			location = 0;
		} else {
			location = Math.max(slideOffsetLeft, 0);
		}
		
		// the max scale we want to add is 0.1 so we multiply location by 0.1
		const locationPercentage = location * 0.1 / containerCenterPoint;
		
		// multiplying locationPercentage by 800 will give margin less or equal to 80
		// slideSideMargins may consty but will always mean max margin
		const sideMargin = locationPercentage * (slideSideMargins * 10);
		// multiplying locationPercentage by 10 will give opacity less or equal to 1
		const opacity = locationPercentage * 10;
		
		slide.style.transform = 'scale(' + (1 + locationPercentage) + ')';
		slide.style.opacity = Math.max(opacity, 0.25); // min opacity is 0.25
		slide.style.marginLeft = Math.max(sideMargin, 25) + 'px'; // min margin is 25
		slide.style.marginRight= Math.max(sideMargin, 25) + 'px'; // min margin is 25
		slideTitle.style.opacity = opacity;
	}
	
	// eventListeners functions
	const handleSlides = () => {
		slidesContainerWidth = slidesContainer.getBoundingClientRect().width;
		const slidesContainerCenterPoint = slidesContainerWidth / 2;
		const slidesInView = getSlidesInView(slidesContainerWidth);
		
		slidesInView.forEach(slide => {
			window.requestAnimationFrame(() => {
				animateSlide(slide, slidesContainerCenterPoint, slidesContainerWidth)
			});
		})
	}
	
	const handleContainerScroll = () => {
		centeredSlide = null;
		window.clearTimeout(isScrollingTimer);
		window.clearTimeout(centerSlideTimer);
		
		isScrollingTimer = setTimeout(function() {
			if (currentPlayerPlaying) {
				const playingSlide = currentPlayerPlaying.a.parentNode.parentNode;
				
				if (currentPlayerPlaying.getPlayerState() === PLAYING) {
					centerSlideTimer = setTimeout(() => {
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
			centerSlideTimer = setTimeout(() => {
				const closestSlideToCenter = getClosestSlideToTheCenter();
				if (closestSlideToCenter !== centeredSlide) {
					centerSlide(closestSlideToCenter);
				}
			}, 500);
		}
		
		handleSlides();
	}
	
	const navigateSlidesWithButton = e => {
		const button = e.currentTarget;
		const isNextButton = button.className === 'next-slide';
		button.setAttribute('disabled','');
		if (currentPlayerPlaying && currentPlayerPlaying.getPlayerState() === PLAYING) {
			currentPlayerPlaying.pauseVideo();
		}
		
		const currentSlide = (centeredSlide || getClosestSlideToTheCenter());
		const upComingSlide = isNextButton ? currentSlide.nextElementSibling : currentSlide.previousElementSibling;
		
		if (upComingSlide) {
			const upComingSlideIndex = allSlides.indexOf(upComingSlide);
			const isLastSlide = upComingSlideIndex === allSlides.length - 1;
			const isFirstSlide = upComingSlideIndex === 0;
			
			if (isLastSlide || isFirstSlide) {
				button.style.display = 'none';
			} else {
				const sibButton = (button.nextElementSibling || button.previousElementSibling);
				if (sibButton.style.display === 'none') {
					sibButton.style.display = '';
				}
			}
			
			centerSlide(upComingSlide, () => {
				button.removeAttribute('disabled');
			});
		}
		
	}
	
	// essential functions
	const setYoutubeIFrame = (data, autoPlay = false) => {
		const player = new YT.Player(data.videoId, {
			videoId: data.videoId,
			host: 'https://www.youtube.com',
			playerVars: {
				fs: 1,
				autoplay: autoPlay ? 1 : 0,
				enablejsapi: 1,
				modestbranding: 1,
				rel: 0,
				showinfo: 0,
				origin:  window.location.href
			},
			events: {
				'onReady': () => {
					console.log('onReady');
				},
				'onStateChange': e => {
					const slide = player.a.parentNode.parentNode;
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
	}
	
	const populateSlides  = (dataList, slidesContainer) => {
		const docFragment = document.createDocumentFragment();
		
		const iFrameContainers = [];
		dataList.forEach(data => {
			const slide = document.createElement('SECTION');
			slide.className = 'slide';
			
			const slideTitle = document.createElement('H2');
			slideTitle.textContent = data.title;
			
			const iFrameContainer = document.createElement('DIV');
			const iFrame = document.createElement('DIV');
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
		dataList.forEach(data => {
			setYoutubeIFrame(data);
		})
		allSlides = [...slidesContainer.children];
		handleSlides();
	}
	
	const init = dataList =>  {
		const docFragment = document.createDocumentFragment();
		
		slidesContainer = document.createElement('DIV');
		slidesContainer.className = 'slides-container';
		slidesContainer.addEventListener('scroll', handleContainerScroll);
		
		const slidesNavButtons = document.createElement('DIV');
		slidesNavButtons.className = 'slider-nav-buttons';
		
		const prevButton = document.createElement('BUTTON');
		prevButton.setAttribute('type', 'button');
		prevButton.className = 'prev-slide';
		prevButton.textContent = 'prev';
		prevButton.addEventListener('click', navigateSlidesWithButton);
		
		const nextButton = document.createElement('BUTTON');
		nextButton.setAttribute('type', 'button');
		nextButton.className = 'next-slide';
		nextButton.textContent = 'next';
		nextButton.addEventListener('click', navigateSlidesWithButton);
		
		slidesNavButtons.appendChild(nextButton);
		slidesNavButtons.appendChild(prevButton);
		
		docFragment.appendChild(slidesContainer);
		docFragment.appendChild(slidesNavButtons);
		
		videoSliderContainer.appendChild(docFragment);
		populateSlides(dataList, slidesContainer)
	}
	
	window.addEventListener('resize', handleSlides)
	
	if (youtubePosts.length) {
		init(youtubePosts);
	} else {
		videoSliderContainer.remove();
	}
}

