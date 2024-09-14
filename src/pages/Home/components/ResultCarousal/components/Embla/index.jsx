import React from 'react'
import ReactDOM from 'react-dom/client'
import EmblaCarousel from './Carousal'
import '../../../../../../assets/styles/embla/index.css'
import { Link } from 'react-router-dom'

const OPTIONS = { loop: true }

const Carousel = ({ slides }) => (
    <>
        <EmblaCarousel slides={slides} options={OPTIONS} />
        <Link to='/results' className='text-center block text-2xl font-bold text-purple-800 mt-10'>View All Results</Link>
    </>
)

export default Carousel;

