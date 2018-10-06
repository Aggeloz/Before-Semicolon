
// on document ready
{
	window.addEventListener('load', () => {
		// const waitingView = document.getElementById('waiting-view')
		// waitingView.classList.add('hide');
		// waitingView.classList.add('completed');
		// setTimeout(() => {
		// 	waitingView.remove()
		// }, 1050)
	}, false);
	
	window.requestAnimationFrame =
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (f) {
			setTimeout(f, 1000 / 60)
		};
	
	//  t = current time
	//  b = start value
	//  c = change in value
	//  d = duration
	Math.easeInOutQuad = function (t, b, c, d) {
		t /= d / 2
		if (t < 1) return c / 2 * t * t + b
		t--
		return -c / 2 * (t * (t - 2) - 1) + b
	};
}

const setYoutubePlayer = (iFrameId, videoId, autoPlay = false, events = {}) => {
	const {protocol, host} = window.location
	
	return new YT.Player(iFrameId, {
		videoId,
		host: 'http://www.youtube.com',
		playerVars: {
			fs: 1,
			autoplay: autoPlay ? 1 : 0,
			enablejsapi: 1,
			modestbranding: 1,
			rel: 0,
			showinfo: 0,
			origin: `${protocol}//${host}`
		},
		events
	});
}

// setupSliders
// will be called when youtube api is ready
// since that check is done in the index.html, it is set as global function for easy access
window.setupSliders = () => {
	
	const videoSliderContainer = document.getElementById('video-slider')
	const youtubePosts = posts.filter(post => post.type === POST_TYPES.YOUTUBE)
	const {PLAYING, BUFFERING, CUED, PAUSED, UNSTARTED} = window.YT.PlayerState
	const players = []
	
	let allSlides = []
	let nextButton = null
	let prevButton = null
	let slidesContainer = null
	let slidesContainerWidth = null
	let currentPlayerPlaying = null
	let centeredSlide = null
	let isScrollingTimer = null
	let centerSlideTimer = null
	let centering = false
	
	// aid/utility functions
	const pauseAllPlayers = (playerToSkip = null) => {
		players.forEach(player => {
			// a here refers to the iFrame
			if (!playerToSkip || player.a.id !== playerToSkip.a.id) {
				player.pauseVideo()
			}
		})
	}
	
	const scrollSlidesContainer = (to, duration, onDone = null) => {
		
		let start = slidesContainer.scrollLeft,
			change = to - start,
			currentTime = 0,
			increment = 20
		
		const animateScroll = function () {
			currentTime += increment
			slidesContainer.scrollLeft = Math.easeInOutQuad(currentTime, start, change, duration)
			
			if (currentTime < duration) {
				setTimeout(() => {
					window.requestAnimationFrame(animateScroll)
				}, increment)
			} else if (onDone) {
				onDone()
			}
		}
		
		animateScroll()
	}
	
	const toggleNavButtonsAccordingToSlide = slide => {
		const upComingSlideIndex = allSlides.indexOf(slide)
		const isLastSlide = upComingSlideIndex === allSlides.length - 1
		const isFirstSlide = upComingSlideIndex === 0
		
		nextButton.style.display = isLastSlide ? 'none' : ''
		prevButton.style.display = isFirstSlide ? 'none' : ''
	}
	
	const centerSlide = (slide, onDone = null) => {
		if (centering ) {return;}
		centering = true;
		toggleNavButtonsAccordingToSlide(slide)
		const {width: slideWidth} = slide.getBoundingClientRect()
		const {width: containerWidth} = slidesContainer.getBoundingClientRect()
		
		// center slide has 80px left and right we just want half of it
		const scrollLeftTo = slide.offsetLeft - ((containerWidth - slideWidth) / 2) - 40
		scrollSlidesContainer(scrollLeftTo, 400, () => {
			centeredSlide = slide
			centering = false
			if (onDone) {
				onDone()
			}
		})
	}
	
	const isSlideAppearingOnTheLeft = slideLeftOffset => {
		return slideLeftOffset <= slidesContainerWidth
	}
	
	const isSlideInView = slide => {
		const {left: slideLeftOffset, width: slideWidth} = slide.getBoundingClientRect()
		return ((slideLeftOffset > 0 || (slideLeftOffset + slideWidth) > 0) && isSlideAppearingOnTheLeft(slideLeftOffset))
	}
	
	const getSlidesInView = () => {
		const slidesInView = []
		
		// using every makes sure the loop quits when no other element is appearing in view
		// it is not need to keep iterating over the list if the rest are not in view
		allSlides.every(slide => {
			// only push if the slide is still in view
			if (isSlideInView(slide)) {
				slidesInView.push(slide)
			}
			
			return isSlideAppearingOnTheLeft(slide.getBoundingClientRect().left)
		})
		
		return slidesInView
	}
	
	const getClosestSlideToTheCenter = () => {
		const slidesInView = getSlidesInView()
		const slidesDistanceToCenter = []
		
		slidesInView.forEach((slide, index) => {
			const {width, left} = slide.getBoundingClientRect()
			slidesDistanceToCenter[index] = Math.abs((slidesContainerWidth / 2) - (left + (width / 2)))
		})
		
		const shortestDistance = Math.min(...slidesDistanceToCenter)
		const shortestDistanceSlideIndex = slidesDistanceToCenter.indexOf(shortestDistance)
		
		return slidesInView[shortestDistanceSlideIndex]
	}
	
	const animateSlide = (slide, containerCenterPoint, containerWidth) => {
		const slideTitle = slide.querySelector('h2')
		const {left, width} = slide.getBoundingClientRect()
		// start growing when the center of the slide comes in view
		const slideOffsetLeft = left + (width / 2)
		let offsetLeft = null
		
		if (slideOffsetLeft > containerCenterPoint) {
			offsetLeft = Math.max(containerWidth - slideOffsetLeft, 0)
		} else if (slideOffsetLeft <= 0) {
			offsetLeft = 0
		} else {
			offsetLeft = Math.max(slideOffsetLeft, 0)
		}
		
		// the max scale we want to add is 0.1 so we multiply offsetLeft by 0.1
		const offsetLeftPercentage = offsetLeft * 0.1 / containerCenterPoint
		
		// multiplying offsetLeftPercentage by 10 will give opacity less or equal to 1
		const opacity = offsetLeftPercentage * 10
		
		// slide.style.transform = 'scale(' + (1 + offsetLeftPercentage) + ')'
		slide.style.opacity = Math.max(opacity, 0.25) // min opacity is 0.25
		slideTitle.style.opacity = opacity
	}
	
	// eventListeners functions
	const handleSlides = () => {
		slidesContainerWidth = slidesContainer.getBoundingClientRect().width
		const slidesContainerCenterPoint = slidesContainerWidth / 2
		const slidesInView = getSlidesInView(slidesContainerWidth)
		
		slidesInView.forEach(slide => {
			window.requestAnimationFrame(() => {
				animateSlide(slide, slidesContainerCenterPoint, slidesContainerWidth)
			})
		})
	}
	
	const handleContainerScroll = () => {
		centeredSlide = null
		window.clearTimeout(isScrollingTimer)
		window.clearTimeout(centerSlideTimer)
		
		isScrollingTimer = setTimeout(function () {
			if (currentPlayerPlaying) {
				const playingSlide = currentPlayerPlaying.a.parentNode.parentNode
				
				if (currentPlayerPlaying.getPlayerState() === PLAYING) {
					centerSlideTimer = setTimeout(() => {
						if (isSlideInView(playingSlide)) {
							centerSlide(playingSlide)
						} else {
							currentPlayerPlaying.pauseVideo()
							centerClosestSlide()
						}
					}, 1000)
				}
			} else {
				centerClosestSlide()
			}
		}, 66)
		
		function centerClosestSlide () {
			centerSlideTimer = setTimeout(() => {
				const closestSlideToCenter = getClosestSlideToTheCenter()
				if (closestSlideToCenter !== centeredSlide) {
					centerSlide(closestSlideToCenter)
				}
			}, 500)
		}
		
		handleSlides()
	}
	
	const navigateSlidesWithButton = e => {
		const button = e.currentTarget
		const isNextButton = button.className === 'next-slide'
		button.setAttribute('disabled', '')
		if (currentPlayerPlaying && currentPlayerPlaying.getPlayerState() === PLAYING) {
			currentPlayerPlaying.pauseVideo()
		}
		
		const currentSlide = (centeredSlide || getClosestSlideToTheCenter())
		const upComingSlide = isNextButton ? currentSlide.nextElementSibling : currentSlide.previousElementSibling
		
		if (upComingSlide) {
			centerSlide(upComingSlide, () => {
				button.removeAttribute('disabled')
			})
		}
		
	}
	
	// essential functions
	const setYoutubeIFrame = data => {
	
		const player = setYoutubePlayer(data.videoId, data.videoId, false, {
			onStateChange: e => {
				const slide = player.a.parentNode.parentNode
				if (e.data === BUFFERING || e.data === PLAYING) {
					pauseAllPlayers(player)
					currentPlayerPlaying = player
					if (!centeredSlide || centeredSlide !== slide) {
						centerSlide(slide)
					}
				} else if (e.data === PAUSED) {
					currentPlayerPlaying = null
				}
			}
		});
		
		players.push(player)
	}
	
	const populateSlides = (dataList, slidesContainer) => {
		const docFragment = document.createDocumentFragment()
		
		const iFrameContainers = []
		dataList.forEach(data => {
			const slide = document.createElement('SECTION')
			slide.className = 'slide'
			
			const slideTitle = document.createElement('H2')
			slideTitle.textContent = data.title
			
			const iFrameContainer = document.createElement('DIV')
			const iFrame = document.createElement('DIV')
			iFrame.className = 'content'
			iFrame.id = data.videoId // this is used to mark the div to be replaced by youtube api with iframe
			iFrameContainer.className = 'video-iFrame-container'
			iFrameContainer.appendChild(iFrame)
			iFrameContainers.push(iFrameContainer)
			
			slide.appendChild(iFrameContainer)
			slide.appendChild(slideTitle)
			docFragment.appendChild(slide)
		})
		
		slidesContainer.appendChild(docFragment)
		// need this to set iFrame after all slides are appended on the real DOM
		// dataList.forEach(data => {
		// 	setYoutubeIFrame(data)
		// })
		allSlides = [...slidesContainer.children]
		handleSlides()
	}
	
	const init = dataList => {
		const docFragment = document.createDocumentFragment()
		
		slidesContainer = document.createElement('DIV')
		slidesContainer.className = 'slides-container'
		slidesContainer.addEventListener('scroll', handleContainerScroll)
		
		const slidesNavButtons = document.createElement('DIV')
		slidesNavButtons.className = 'slider-nav-buttons'
		
		prevButton = document.createElement('BUTTON')
		prevButton.setAttribute('type', 'button')
		prevButton.className = 'prev-slide'
		prevButton.style.display = 'none'
		prevButton.textContent = 'prev'
		prevButton.addEventListener('click', navigateSlidesWithButton)
		
		nextButton = document.createElement('BUTTON')
		nextButton.setAttribute('type', 'button')
		nextButton.className = 'next-slide'
		nextButton.textContent = 'next'
		nextButton.addEventListener('click', navigateSlidesWithButton)
		
		slidesNavButtons.appendChild(prevButton)
		slidesNavButtons.appendChild(nextButton)
		
		docFragment.appendChild(slidesContainer)
		docFragment.appendChild(slidesNavButtons)
		
		videoSliderContainer.appendChild(docFragment)
		populateSlides(dataList, slidesContainer)
	}
	
	window.addEventListener('resize', handleSlides)
	
	if (youtubePosts.length) {
		init(youtubePosts)
	} else {
		videoSliderContainer.remove()
	}
}

// modal setup
const closeModal = e => {
	const closeButton = e.target;
	const element = document.getElementById('modal-base');
	const {left, top, width, height} = element.getBoundingClientRect();
	const modal = document.getElementById('modal');
	const modalContent = document.querySelector('.modal-content');
	
	[closeButton, modalContent].forEach(el => {
		el.classList.add('go-away');
		setTimeout(() => {
			el.remove();
		} , 300);
	});
	
	modal.style.width = width + 'px'
	modal.style.height = height + 'px'
	modal.style.top = top + 'px'
	modal.style.left = left + 'px';
	
	// this makes it so when it is almost fully shrunk it stacks below header level(z-index 2)
	setTimeout(() => {
		modal.style.zIndex = '1';
	}, 300);
	
	setTimeout(() => {
		modal.remove();
		element.removeAttribute('id');
		element.removeAttribute('style');
	}, 600)
	
}

const getModalContent = data => {
	const docFragment = document.createDocumentFragment();
	const closeModalButton = document.createElement('BUTTON')
	closeModalButton.setAttribute('type', 'button')
	closeModalButton.className = 'close-modal';
	closeModalButton.addEventListener('click', e => {
		window.requestAnimationFrame(() => {
			closeModal(e)
		});
	});
	
	const modalContent = document.createElement('DIV')
	modalContent.className = 'modal-content';
	
	const videoIFrameContainer = document.createElement('DIV');
	videoIFrameContainer.className = `video-iFrame-container ${data.type === POST_TYPES.GITHUB ? 'github-preview' : ''}`;
	
	if (data.type === POST_TYPES.YOUTUBE) {
		const modalYoutubeIFrame = document.createElement('DIV');
		modalYoutubeIFrame.className = 'content';
		modalYoutubeIFrame.id = `modal-${data.videoId}`;
		videoIFrameContainer.appendChild(modalYoutubeIFrame);
	}
	
	if (data.type === POST_TYPES.GITHUB) {
		const modalGithubIFrame = document.createElement('IFRAME');
		modalGithubIFrame.className = 'content';
		modalGithubIFrame.src = data.url;
		videoIFrameContainer.appendChild(modalGithubIFrame);
	}
	
	modalContent.appendChild(videoIFrameContainer);
	
	if (data.githubCodeURL) {
		const githubLink = document.createElement('A');
		githubLink.className = 'github-link';
		githubLink.href = data.githubCodeURL;
		githubLink.target = '_blank';
		githubLink.textContent = 'View Code';
		modalContent.appendChild(githubLink);
	}
	
	if (data.youtubeVideoURL) {
		const youtubeLink = document.createElement('A');
		youtubeLink.className = 'youtube-link';
		youtubeLink.href = data.youtubeVideoURL;
		youtubeLink.target = '_blank';
		youtubeLink.textContent = 'Watch Video';
		modalContent.appendChild(youtubeLink);
	}
	
	docFragment.appendChild(closeModalButton);
	docFragment.appendChild(modalContent);
	
	return docFragment;
}

const previewMedia = (element, data) => {
	const {left, top, width, height} = element.getBoundingClientRect();
	const elementClone = element.cloneNode(true);
	element.id = 'modal-base';
	element.style.opacity = '.2';
	
	elementClone.id = 'modal';
	elementClone.style.background = 'rgba(40, 54, 74, 0.95)';
	elementClone.style.display = 'block';
	elementClone.style.position = 'fixed';
	elementClone.style.margin = '0px'
	elementClone.style.overflow = 'hidden'
	elementClone.style.borderRadius = '0px'
	elementClone.style.width = width + 'px'
	elementClone.style.height = height + 'px'
	elementClone.style.top = top + 'px'
	elementClone.style.left = left + 'px'
	elementClone.style.zIndex = '1';
	elementClone.style.transition =
		"top .5s ease-in-out, " +
		"left .5s ease-in-out, " +
		"height .5s ease-in-out, " +
		"width .5s ease-in-out";
	document.querySelector('body').appendChild(elementClone);
	
	// this makes it so when it is almost fully grown it stacks above header level(z-index 2)
	setTimeout(() => {
		elementClone.style.zIndex = '10';
	}, 300);
	
	[...elementClone.children].forEach(child => {
		child.classList.add('fade-out');
		setTimeout(() => {
			child.style.display = 'none'
		}, 300)
	});
	
	setTimeout(() => {
		elementClone.style.top = '0px'
		elementClone.style.left = '0px'
		elementClone.style.width = '100vw'
		elementClone.style.height = '100vh'
	}, 0)
	
	elementClone.appendChild(getModalContent(data));
	setYoutubePlayer(`modal-${data.videoId}`, data.videoId, true);
}

// posts setup
{
	const uiExamplesContainer = document.getElementById('ui-examples')
	const githubPosts = posts.filter(post => post.type === POST_TYPES.GITHUB)
	
	const populatePosts = dataList => {
		const postsContainer = document.createElement('DIV')
		
		dataList.forEach(data => {
			const post = document.createElement('ARTICLE')
			post.className = 'post'
			post.addEventListener('click', () => {
				window.requestAnimationFrame(() => {
					previewMedia(post, data)
				});
			})
			
			const thumbnail = document.createElement('DIV')
			thumbnail.className = 'thumbnail'
			
			const img = document.createElement('IMG')
			img.src = data.thumbnailPath
			img.alt = data.title
			img.className = 'content'
			
			thumbnail.appendChild(img)
			
			const title = document.createElement('H3')
			title.textContent = data.title
			
			post.appendChild(thumbnail)
			post.appendChild(title)
			
			postsContainer.appendChild(post)
		})
		
		uiExamplesContainer.appendChild(postsContainer)
		
	}
	
	if (githubPosts.length) {
		populatePosts(githubPosts)
	} else {
		uiExamplesContainer.remove()
	}
}

// search setup
{
	const searchResultsContainer = document.createElement('SECTION')
	searchResultsContainer.id = 'search-results'
	const searchResultsContainerTitle = document.createElement('H2')
	const searchForm = document.getElementById('search-form')
	const searchField = searchForm[0]
	const clearSearchButton = searchForm[1]
	const mainContent = document.querySelector('.main-content')
	const videoSlider = document.getElementById('video-slider')
	const uiExamples = document.getElementById('ui-examples')
	
	let searchTerm = ''
	let resultsCount = 0
	let searchTimer = null
	
	const toggleResults = (visible = true) => {
		if (visible) {
			searchResultsContainer.style.display = ''
			videoSlider.classList.add('fade-out')
			uiExamples.classList.add('fade-out')
			setTimeout(() => {
				videoSlider.style.display = 'none'
				uiExamples.style.display = 'none'
			}, 300)
		} else {
			searchResultsContainer.classList.add('fade-out')
			setTimeout(() => {
				videoSlider.style.display = ''
				uiExamples.style.display = ''
				searchResultsContainer.style.display = 'none'
				videoSlider.classList.remove('fade-out')
				uiExamples.classList.remove('fade-out')
			}, 300)
		}
	}
	
	const displayResults = results => {
		toggleResults()
		
		if (!document.getElementById('search-results')) {
			searchResultsContainerTitle.insertAdjacentHTML('afterbegin',
				'<b>' + resultsCount + '</b> results found for:<span>"' + searchTerm + '"</span>')
			searchResultsContainer.appendChild(searchResultsContainerTitle)
			searchResultsContainer.appendChild(document.createElement('DIV'))
			mainContent.appendChild(searchResultsContainer)
		} else {
			searchResultsContainerTitle.children[0].textContent = `${resultsCount}`
			searchResultsContainerTitle.children[1].textContent = `"${searchTerm}"`
		}
		
		searchResultsContainer.lastElementChild.innerHTML = ''
		searchResultsContainer.lastElementChild.appendChild(results)
		
	}
	
	const getSearchResultPostElement = post => {
		
		const resultPost = document.createElement('DIV')
		resultPost.className = `search-result ${post.type}`
		resultPost.addEventListener('click', () => {
			window.requestAnimationFrame(() => {
				previewMedia(resultPost, post)
			})
		})
		
		const title = document.createElement('H3')
		title.textContent = post.title
		
		resultPost.appendChild(title)
		
		return resultPost
	}
	
	const searchInPostsAndGetResults = () => {
		const terms = searchTerm.split(' ')
		const termsRegex = terms.map(term => new RegExp(term, 'gmi'))
		const results = []
		
		posts.forEach(post => {
			termsRegex.forEach(term => {
				if (results.indexOf(post) < 0) {
					if (term.test(post.title)) { // things matching title are more relevant so should appear first
						results.unshift(post)
						++resultsCount
					} else if (term.test(post.description)) {
						results.push(post)
						++resultsCount
					}
				}
			})
		})
		
		return results
	}
	
	searchForm.addEventListener('submit', e => {
		e.preventDefault()
	})
	
	searchField.addEventListener('input', e => {
		searchTerm = e.target.value.trim()
		resultsCount = 0
		
		window.clearTimeout(searchTimer) // adds delay over typing
		
		if (searchTerm.length) {
			clearSearchButton.classList.add('clear')
			
			if (searchTerm.length >= 3) {
				searchTimer = setTimeout(() => {
					const resultsFragment = document.createDocumentFragment()
					const results = searchInPostsAndGetResults()
					
					results.forEach(res => resultsFragment.appendChild(getSearchResultPostElement(res)))
					
					if (resultsCount === 0) {
						const noResultMessage = document.createElement('P')
						noResultMessage.textContent = `Nothing matched "${searchTerm}". If you think it doesn't exist yet, send a suggestion!`
						resultsFragment.appendChild(noResultMessage)
					}
					
					displayResults(resultsFragment)
					
				}, 500)
			}
		} else {
			clearSearchButton.classList.remove('clear')
		}
	})
	
	searchField.addEventListener('blur', () => {
		window.clearTimeout(searchTimer) // adds delay over typing
		
		if (!searchTerm) {
			searchTimer = setTimeout(() => {
				toggleResults(false)
			}, 300)
		}
	})
	
	clearSearchButton.addEventListener('click', () => {
		if (searchTerm) {
			searchField.value = '';
			clearSearchButton.classList.remove('clear');
			toggleResults(false);
		}
	})
	
}

// mobile menu setup
{
	const siteHeader = document.querySelector('header');
	const siteTitle = document.querySelector('h1');
	const nav = document.querySelector('nav');
	const mobileMenuToggle = document.querySelector('button.menu-toggle');
	const main = document.querySelector('main');
	const footer = document.querySelector('footer');
	
	let animating = false
	
	const toggleHiddenMenu = e => {
		const button = e.target;
		
		button.classList.toggle('active');
		siteHeader.classList.toggle('menu-active');
		nav.classList.toggle('active');
		footer.classList.add('menu-active');
		
		if (main.classList.contains('shrink')) {
			main.style.top = '0px';
			main.style.left = '0px';
			main.style.transform = 'scale(1)';
			
			setTimeout(() => {
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
			
			setTimeout(() => {
				main.classList.add('shrink');
				main.style.transform = 'scale(0.70)';
				main.style.left = '-35vw';
			}, 0);
		}
	}
	
	mobileMenuToggle.addEventListener('click', e => {
		window.requestAnimationFrame(() => {
			toggleHiddenMenu(e);
		});
		
	})
}