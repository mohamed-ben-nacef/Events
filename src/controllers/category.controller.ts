import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
import Equipment from '../models/Equipment';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all categories
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const includeSubcategories = req.query.includeSubcategories !== 'false';

    const categories = await Category.findAll({
      include: includeSubcategories
        ? [
            {
              model: Subcategory,
              as: 'subcategories',
              required: false,
            },
          ]
        : [],
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        categories,
      },
    });
  }
);

// Get category by ID
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          required: false,
        },
      ],
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.json({
      success: true,
      data: {
        category,
      },
    });
  }
);

// Create category
export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, icon } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      where: { name: { [Op.iLike]: name } }, // Case-insensitive check
    });

    if (existingCategory) {
      throw new ConflictError('Category with this name already exists');
    }

    const category = await Category.create({
      name,
      description,
      icon,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category,
      },
    });
  }
);

// Update category
export const updateCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { name, description, icon } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // If name is being updated, check for conflicts
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name: { [Op.iLike]: name },
          id: { [Op.ne]: id as string },
        },
      });

      if (existingCategory) {
        throw new ConflictError('Category with this name already exists');
      }
    }

    // Update fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;

    await category.update(updateData);

    // Fetch updated category with subcategories
    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory,
      },
    });
  }
);

// Delete category
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          required: false,
        },
      ],
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check if category has associated equipment
    const equipmentCount = (category as any).equipment?.length || 0;
    if (equipmentCount > 0) {
      throw new ValidationError(
        `Cannot delete category. It has ${equipmentCount} associated equipment item(s). Please remove or reassign equipment first.`
      );
    }

    // Delete category (cascades to subcategories)
    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  }
);

// Get all subcategories
export const getAllSubcategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.query;

    const whereClause: any = {};
    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    const subcategories = await Subcategory.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          required: true,
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        subcategories,
      },
    });
  }
);

// Get subcategory by ID
export const getSubcategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const subcategory = await Subcategory.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          required: true,
        },
      ],
    });

    if (!subcategory) {
      throw new NotFoundError('Subcategory not found');
    }

    res.json({
      success: true,
      data: {
        subcategory,
      },
    });
  }
);

// Create subcategory
export const createSubcategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category_id, name, description } = req.body;

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check if subcategory with same name already exists in this category
    const existingSubcategory = await Subcategory.findOne({
      where: {
        category_id,
        name: { [Op.iLike]: name }, // Case-insensitive check
      },
    });

    if (existingSubcategory) {
      throw new ConflictError(
        'Subcategory with this name already exists in this category'
      );
    }

    const subcategory = await Subcategory.create({
      category_id,
      name,
      description,
    });

    // Fetch with category relation
    const subcategoryWithCategory = await Subcategory.findByPk(subcategory.id, {
      include: [
        {
          model: Category,
          as: 'category',
          required: true,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: {
        subcategory: subcategoryWithCategory,
      },
    });
  }
);

// Update subcategory
export const updateSubcategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { category_id, name, description } = req.body;

    const subcategory = await Subcategory.findByPk(id);

    if (!subcategory) {
      throw new NotFoundError('Subcategory not found');
    }

    // If category_id is being updated, verify new category exists
    if (category_id && category_id !== subcategory.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    // If name is being updated, check for conflicts in the same category
    const targetCategoryId = category_id || subcategory.category_id;
    if (name && name !== subcategory.name) {
      const existingSubcategory = await Subcategory.findOne({
        where: {
          category_id: targetCategoryId,
          name: { [Op.iLike]: name },
          id: { [Op.ne]: id as string },
        },
      });

      if (existingSubcategory) {
        throw new ConflictError(
          'Subcategory with this name already exists in this category'
        );
      }
    }

    // Update fields
    const updateData: any = {};
    if (category_id !== undefined) updateData.category_id = category_id;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await subcategory.update(updateData);

    // Fetch updated subcategory with category
    const updatedSubcategory = await Subcategory.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          required: true,
        },
      ],
    });

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: {
        subcategory: updatedSubcategory,
      },
    });
  }
);

// Delete subcategory
export const deleteSubcategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const subcategory = await Subcategory.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          required: false,
        },
      ],
    });

    if (!subcategory) {
      throw new NotFoundError('Subcategory not found');
    }

    // Check if subcategory has associated equipment
    const equipmentCount = (subcategory as any).equipment?.length || 0;
    if (equipmentCount > 0) {
      throw new ValidationError(
        `Cannot delete subcategory. It has ${equipmentCount} associated equipment item(s). Please remove or reassign equipment first.`
      );
    }

    // Delete subcategory
    await subcategory.destroy();

    res.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  }
);
