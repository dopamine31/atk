/* Kelola produk */
function renderProdList(){
  $('prodCount').textContent = products.length+' produk';
  $('prodList').innerHTML = products.map(p=>`
    <div class="item">
      <div class="nm">${esc(p.name)}<small>Rp ${rp(p.price)}</small></div>
      <div class="acts">
        <button class="btn sm" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn red sm" onclick="delProduct(${p.id})">Hapus</button>
      </div>
    </div>`).join('') || '<div class="empty">Belum ada produk. Isi formulir di atas untuk menambah.</div>';
}

function saveProduct(){
  const name=$('pName').value.trim(), price=parseInt($('pPrice').value);
  if(!name||isNaN(price)||price<0) return toast('Isi nama & harga dengan benar');
  const id=$('pId').value;
  if(id){ const p=products.find(x=>x.id==id); if(p){ p.name=name; p.price=price; } }
  else products.push({id:Date.now(),name,price});
  save(KEY.products,products); resetProdForm(); renderProdList(); renderProducts(); toast('Produk disimpan');
}

function editProduct(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  $('pId').value=p.id; $('pName').value=p.name; $('pPrice').value=p.price;
  window.scrollTo({top:0,behavior:'smooth'});
}

function delProduct(id){
  if(!confirm('Hapus produk?')) return;
  products=products.filter(x=>x.id!==id);
  save(KEY.products,products); renderProdList(); renderProducts();
}

function delAllProducts(){
  if(!products.length) return toast('Daftar produk sudah kosong');
  if(!confirm('Hapus SEMUA produk ('+products.length+')? Riwayat transaksi tidak terpengaruh.')) return;
  products=[]; save(KEY.products,products); renderProdList(); renderProducts(); toast('Semua produk dihapus');
}

function resetProdForm(){ $('pId').value=$('pName').value=$('pPrice').value=''; }