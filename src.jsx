import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const toys = [
  { id: 'bear', name: 'Maple the Teddy', category: 'Plush', age: '2+', price: 24, emoji: '🧸' },
  { id: 'rainbow', name: 'Rainbow Stacker', category: 'Building', age: '3+', price: 28, emoji: '🌈' },
  { id: 'rocket', name: 'Little Voyager Rocket', category: 'Vehicles', age: '3+', price: 22, emoji: '🚀' },
  { id: 'dino', name: 'Pickles the Dino', category: 'Plush', age: '2+', price: 26, emoji: '🦕' },
  { id: 'car', name: 'Little Red Racer', category: 'Vehicles', age: '3+', price: 18, emoji: '🏎️' },
  { id: 'puzzle', name: 'Hello Sunshine Puzzle', category: 'Puzzles', age: '4+', price: 20, emoji: '☀️' },
];

const categories = ['All toys', 'Plush', 'Building', 'Vehicles', 'Puzzles'];
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatPrice = price => money.format(price);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('toybox-cart'));
    return Object.fromEntries(toys.filter(toy => Number.isSafeInteger(saved?.[toy.id]) && saved[toy.id] > 0)
      .map(toy => [toy.id, saved[toy.id]]));
  } catch {
    return {};
  }
}

function BagIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 8h14l2 13H3L5 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>;
}

function App() {
  const [category, setCategory] = useState('All toys');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(loadCart);
  const [notice, setNotice] = useState('');
  const [checkout, setCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const drawer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('toybox-cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  const cartToys = toys.filter(toy => cart[toy.id]);
  const count = cartToys.reduce((sum, toy) => sum + cart[toy.id], 0);
  const total = cartToys.reduce((sum, toy) => sum + toy.price * cart[toy.id], 0);
  const visibleToys = toys.filter(toy =>
    (category === 'All toys' || category === toy.category)
    && `${toy.name} ${toy.category}`.toLowerCase().includes(search.trim().toLowerCase()));

  function changeQuantity(id, amount) {
    setCart(previous => {
      const next = { ...previous };
      const quantity = (next[id] || 0) + amount;
      if (quantity > 0) next[id] = quantity;
      else delete next[id];
      return next;
    });
  }

  function openCart() {
    setCheckout(false);
    setOrderPlaced(false);
    drawer.current.showModal();
  }

  return <>
    <header className="top">
      <div className="wrap nav">
        <a className="brand" href="#" aria-label="Toybox home"><span aria-hidden="true">✿</span> toybox<span className="dot">.</span></a>
        <a className="nav-link" href="#shop">Shop toys</a>
        <button className="cart-button" onClick={openCart}><BagIcon /> Cart <span className="count">{count}</span></button>
      </div>
    </header>
    <main className="wrap">
      <section className="hero" aria-labelledby="headline">
        <div className="hero-copy">
          <h1 id="headline">Little toys.<br />Big adventures.</h1>
          <p>Find a new favorite for little hands and big imaginations.</p>
          <a className="primary" href="#shop">Explore toys</a>
        </div>
        <div className="hero-art" aria-hidden="true" />
      </section>
      <section className="shop" id="shop" aria-labelledby="shop-title">
        <div className="shop-heading">
          <h2 id="shop-title">Find their next favorite</h2>
          <input type="search" aria-label="Search toys" placeholder="Search toys…" value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="categories" aria-label="Toy categories">
          {categories.map(label => <button key={label} aria-pressed={label === category} onClick={() => setCategory(label)}>{label}</button>)}
        </div>
        {visibleToys.length ? <div className="grid">
          {visibleToys.map(toy => <article className="product" key={toy.id}>
            <div className={`product-image photo ${toy.id}`} role="img" aria-label={toy.name}><span aria-hidden="true">{toy.emoji}</span></div>
            <div className="product-copy">
              <p className="meta">{toy.category} <span>·</span> Ages {toy.age}</p>
              <h3>{toy.name}</h3>
              <div className="product-bottom">
                <strong>{formatPrice(toy.price)}</strong>
                <button className="add" aria-label={`Add ${toy.name} to cart`} onClick={() => {
                  changeQuantity(toy.id, 1);
                  setNotice(`${toy.name} added to cart`);
                }}>＋ Add</button>
              </div>
            </div>
          </article>)}
        </div> : <div className="empty"><p>No toys match your search.</p><button className="add" onClick={() => { setCategory('All toys'); setSearch(''); }}>Clear filters</button></div>}
      </section>
      <p className="sr-only" role="status">{notice}</p>
    </main>
    <footer><div className="wrap"><a className="brand" href="#"><span aria-hidden="true">✿</span> toybox<span className="dot">.</span></a><p>Little toys. Big adventures.</p></div></footer>
    <dialog ref={drawer} aria-labelledby="cart-title" onClick={event => { if (event.target === drawer.current) drawer.current.close(); }}>
      <div className="drawer">
        <div className="drawer-header"><h2 id="cart-title">{orderPlaced ? 'Order complete' : checkout ? 'Demo checkout' : 'Your cart'}</h2><button autoFocus className="close" aria-label="Close cart" onClick={() => drawer.current.close()}>×</button></div>
        {orderPlaced ? <p>Your demo order is complete. No payment was collected.</p> : count === 0 ? <>
          <p>Your cart is empty.</p><button className="primary" onClick={() => drawer.current.close()}>Continue shopping</button>
        </> : <>
          <ul className="cart-items">{cartToys.map(toy => <li key={toy.id}>
            <span className={`cart-image photo ${toy.id}`} aria-hidden="true">{toy.emoji}</span>
            <div><strong>{toy.name}</strong><p>{formatPrice(toy.price)}</p>
              {!checkout && <div className="quantity">
                <button aria-label={`Remove one ${toy.name}`} onClick={() => changeQuantity(toy.id, -1)}>−</button>
                <span>{cart[toy.id]}</span>
                <button aria-label={`Add one ${toy.name}`} onClick={() => changeQuantity(toy.id, 1)}>+</button>
              </div>}
              {checkout && <p>Quantity {cart[toy.id]}</p>}
            </div>
          </li>)}</ul>
          <div className="subtotal"><strong>Subtotal</strong><strong>{formatPrice(total)}</strong></div>
          {checkout ? <>
            <p>This is a demo order. No payment is required.</p>
            <button className="primary" onClick={() => { setCart({}); setOrderPlaced(true); }}>Place demo order</button>
            <button className="add back" onClick={() => setCheckout(false)}>Back to cart</button>
          </> : <button className="primary" onClick={() => setCheckout(true)}>Demo checkout</button>}
        </>}
      </div>
    </dialog>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
