import express from 'express';
import {authMiddleware} from '../middleware/auth-middleware.js';
import Product from '../models/product.js';

const router = express.Router();

// public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find(undefined, undefined, undefined).populate('owner', 'name email').lean();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching products', error: err.message});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('owner', 'name email').lean();

        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching product', error: err.message});
    }
});

// protected
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {name, description, price, variations} = req.body;

        if (!name || price == null) {
            return res.status(400).json({message: 'name and price required'});
        }

        const p = await Product.create({
            name,
            description,
            price,
            variations: Array.isArray(variations) ? variations : [],
            owner: req.user._id
        });
        res.status(201).json(p);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error creating product', error: err.message});
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updated = await Product.findById(req.params.id);
        if (!updated) {
            return res.status(404).json({message: 'Product not found'});
        }

        // optional: allow only owner to update
        if (updated.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'Forbidden: you do not own this product'});
        }

        const {name, description, price, variations} = req.body;

        if (name !== undefined) {
            updated.name = name;
        }

        if (description !== undefined) {
            updated.description = description;
        }

        if (price !== undefined) {
            updated.price = price;
        }

        if (variations !== undefined) {
            updated.variations = variations;
        }

        await updated.save();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error updating product', error: err.message});
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }

        if (product.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'Forbidden: you do not own this product'});
        }

        await product.deleteOne();
        res.json({message: 'Product deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error deleting product', error: err.message});
    }
});

export default router;