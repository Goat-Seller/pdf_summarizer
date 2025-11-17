import {ErrorBoundary} from 'react-error-boundary'
import Form from './components/Form.jsx'
import './App.css'

function App() {
  return (
    <>
    <ErrorBoundary FallbackComponent={<div>Something went wrong.</div>}>
       <Form/>
    </ErrorBoundary>  
    </>
  )
}

export default App
