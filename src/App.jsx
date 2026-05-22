import { useState, useEffect } from 'react'

function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    stock: '',
    valor: '',
  })
  const [productos, setProductos] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState('formulario')

  const API_URL = 'https://nfcch76zw8.execute-api.us-east-1.amazonaws.com/productos'

  const cargarProductos = async () => {
    setCargando(true)
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setProductos(data.items || [])
    } catch (error) {
      setMensaje(`Error al cargar productos: ${error.message}`)
      setTimeout(() => setMensaje(''), 4000)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre || !formData.stock || !formData.valor) {
      setMensaje('Por favor complete todos los campos')
      return
    }

    const body = {
      id: crypto.randomUUID(),
      nombre: formData.nombre,
      stock: parseInt(formData.stock),
      valorVenta: parseInt(formData.valor),
    }

    setEnviando(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setFormData({ nombre: '', stock: '', valor: '' })
      setMensaje('Producto registrado exitosamente')
      cargarProductos()
    } catch (error) {
      setMensaje(`Error al enviar: ${error.message}`)
    } finally {
      setEnviando(false)
      setTimeout(() => setMensaje(''), 4000)
    }
  }

  return (
    <div className="app">
      <header className="banner">
        <div className="banner-content">
          <div className="banner-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="20" width="48" height="36" rx="3" stroke="currentColor" strokeWidth="3" />
              <path d="M8 28H56" stroke="currentColor" strokeWidth="3" />
              <path d="M20 8L16 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M44 8L48 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M20 8H44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <rect x="24" y="36" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="32" cy="42" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1>Sistema de Inventario</h1>
            <p>Gestión de ingreso de productos al almacén</p>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${vista === 'formulario' ? 'active' : ''}`}
          onClick={() => setVista('formulario')}
        >
          Registrar Producto
        </button>
        <button
          className={`nav-tab ${vista === 'listado' ? 'active' : ''}`}
          onClick={() => { setVista('listado'); cargarProductos(); }}
        >
          Listado de Productos
        </button>
      </nav>

      <main className="main-content">
        {mensaje && (
          <div className={`mensaje ${mensaje.includes('exitosamente') ? 'exito' : 'error'}`}>
            {mensaje}
          </div>
        )}

        {vista === 'formulario' && (
          <section className="form-section">
            <h2>Registrar Nuevo Producto</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Producto</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Tornillos hexagonales"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock (unidades)</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Ej: 150"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="valor">Valor Venta (precio unitario)</label>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  placeholder="Ej: 2500"
                  min="0"
                />
              </div>

              <button type="submit" className="btn-submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Agregar Producto'}
              </button>
            </form>
          </section>
        )}

        {vista === 'listado' && (
          <section className="table-section">
            <div className="table-header">
              <h2>Listado de Productos</h2>
              <button className="btn-refresh" onClick={cargarProductos} disabled={cargando}>
                {cargando ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {cargando ? (
              <p className="loading-text">Cargando productos...</p>
            ) : productos.length === 0 ? (
              <p className="empty-text">No hay productos registrados.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Stock</th>
                      <th>Valor Venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.idTablaEric || producto.id}>
                        <td>{producto.nombre}</td>
                        <td>{producto.stock}</td>
                        <td>${(producto.valorVenta || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
