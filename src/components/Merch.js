'use client';

import { useEffect } from 'react';
import styles from './Merch.module.css';

export default function Merch() {
    useEffect(() => {
        const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

        function ShopifyBuyInit() {
            if (window.ShopifyBuy && window.ShopifyBuy.UI) {
                const client = window.ShopifyBuy.buildClient({
                    domain: 'rwpjga-xx.myshopify.com',
                    storefrontAccessToken: '0a8e89310adc40625e9712dcfad7725e',
                });

                window.ShopifyBuy.UI.onReady(client).then((ui) => {
                    ui.createComponent('collection', {
                        id: '319013290172',
                        node: document.getElementById('collection-component-1764122085379'),
                        moneyFormat: '%24%7B%7Bamount%7D%7D',
                        options: {
                            product: {
                                styles: {
                                    product: {
                                        '@media (min-width: 601px)': {
                                            'max-width': 'calc(25% - 20px)',
                                            'margin-left': '20px',
                                            'margin-bottom': '50px',
                                            'width': 'calc(25% - 20px)'
                                        },
                                        'img': {
                                            'height': 'calc(100% - 15px)',
                                            'position': 'absolute',
                                            'left': '0',
                                            'right': '0',
                                            'top': '0'
                                        },
                                        'imgWrapper': {
                                            'padding-top': 'calc(75% + 15px)',
                                            'position': 'relative',
                                            'height': '0'
                                        }
                                    }
                                },
                                text: {
                                    button: 'Add to cart'
                                }
                            },
                            productSet: {
                                styles: {
                                    products: {
                                        '@media (min-width: 601px)': {
                                            'margin-left': '-20px'
                                        }
                                    }
                                }
                            },
                            modalProduct: {
                                contents: {
                                    img: false,
                                    imgWithCarousel: true,
                                    button: false,
                                    buttonWithQuantity: true
                                },
                                styles: {
                                    product: {
                                        '@media (min-width: 601px)': {
                                            'max-width': '100%',
                                            'margin-left': '0px',
                                            'margin-bottom': '0px'
                                        }
                                    }
                                },
                                text: {
                                    button: 'Add to cart'
                                }
                            },
                            cart: {
                                text: {
                                    total: 'Subtotal',
                                    button: 'Checkout'
                                }
                            },
                        }
                    });
                });
            }
        }

        function loadScript() {
            const script = document.createElement('script');
            script.async = true;
            script.src = scriptURL;
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
            script.onload = ShopifyBuyInit;
        }

        if (window.ShopifyBuy) {
            if (window.ShopifyBuy.UI) {
                ShopifyBuyInit();
            } else {
                loadScript();
            }
        } else {
            loadScript();
        }
    }, []);

    return (
        <section id="merch" className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>BEAR LABS MERCH</h2>
                <p className={styles.subheading}>
                    Rep the brand with premium apparel and accessories
                </p>

                <div id="collection-component-1764122085379" className={styles.productGrid}></div>

                <div className={styles.ctaContainer}>
                    <a
                        href="https://bear-labs-official-merch.myshopify.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.merchButton}
                    >
                        View Full Collection
                    </a>
                </div>
            </div>
        </section>
    );
}
