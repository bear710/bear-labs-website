'use client';
import { Component } from 'react';

/**
 * Suspense only catches the "still loading" promise — an actual load
 * failure (bad GLB, 404, decode error) throws a real error that only a
 * class-based error boundary can catch. On failure this renders the
 * supplied fallback (the procedural placeholder jar) instead of taking
 * down the whole showroom, and logs details in development only.
 */
export default class ModelLoadBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ModelLoadBoundary] imported model failed to load, using procedural fallback:', error, info);
        }
    }

    render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}
