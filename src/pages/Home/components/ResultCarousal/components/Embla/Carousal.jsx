import React, { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { DotButton, useDotButton } from './DotButton'
import Autoplay from 'embla-carousel-autoplay'
import Poster from '../../../../../../components/common/Poster'

const TWEEN_FACTOR_BASE = 0.84

const numberWithinRange = (number, min, max) =>
  Math.min(Math.max(number, min), max)

const EmblaCarousel = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ playOnInit: false, delay: 2000 })
  ])
  const [isPlaying, setIsPlaying] = useState(true)
  const tweenFactor = useRef(0)
  const tweenNodes = useRef([])

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  const onButtonAutoplayClick = useCallback(
    (callback) => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) return

      const resetOrStop =
        autoplay.options.stopOnInteraction === false
          ? autoplay.reset
          : autoplay.stop

      resetOrStop()
      callback()
    },
    [emblaApi]
  )

  const setTweenNodes = useCallback((emblaApi) => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode?.querySelector('.embla__slide__number')
    }).filter(node => node) // Filter out null/undefined nodes
  }, [])

  const setTweenFactor = useCallback((emblaApi) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])


  const tweenScale = useCallback((emblaApi, eventName) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = eventName === 'scroll'

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress)
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            }
          })
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current * 0.2)
        const scale = numberWithinRange(tweenValue, 0, 1).toString()
        const tweenNode = tweenNodes.current[slideIndex]
        emblaApi.slideNodes()[slideIndex].style.transform = `scale(${scale})`
      })
    })
  }, [])  

  const tweenOpacity = useCallback((emblaApi, eventName) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = eventName === 'scroll'

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress)
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            }
          })
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
        const opacity = numberWithinRange(tweenValue, 0, 1).toString()
        emblaApi.slideNodes()[slideIndex].style.opacity = opacity
      })
    })
  }, [])


  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play
    playOrStop()
  }, [emblaApi])

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    setIsPlaying(autoplay.isPlaying())
    emblaApi
      .on('autoplay:play', () => setIsPlaying(true))
      .on('autoplay:stop', () => setIsPlaying(false))
      .on('reInit', () => setIsPlaying(autoplay.isPlaying()))
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    setTweenFactor(emblaApi)
    setTweenNodes(emblaApi)
    tweenOpacity(emblaApi)
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', setTweenFactor)
      .on('reInit', tweenOpacity)
      .on('scroll', tweenOpacity)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)
      .on('slideFocus', tweenOpacity)
  }, [emblaApi, tweenOpacity, tweenScale])

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div className="embla__slide" key={index}>
              <Poster
                programName={slide.programName}
                stage={slide.stage}
                records={slide.records}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls ">
        <div className="embla__dots !mx-auto">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot  '.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
