import Equipment from '../models/Equipment';
import Category from '../models/Category';
import { Op } from 'sequelize';

/**
 * Generates a unique equipment reference
 * Format: EQ-{CATEGORY_CODE}-{SEQUENCE}
 * Example: EQ-SON-001, EQ-VIDEO-001, EQ-LUMIERE-001
 */
export const generateEquipmentReference = async (
  categoryId: string
): Promise<string> => {
  // Get category to determine code
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Extract category code (first 3-4 letters, uppercase)
  const categoryCode = category.name.substring(0, 4).toUpperCase().replace(/\s/g, '');

  // Find the highest sequence number for this category
  const lastEquipment = await Equipment.findOne({
    where: {
      reference: {
        [Op.like]: `EQ-${categoryCode}-%`,
      },
    },
    order: [['reference', 'DESC']],
  });

  let sequence = 1;

  if (lastEquipment) {
    // Extract sequence number from reference (e.g., "EQ-SON-001" -> 1)
    const match = lastEquipment.reference.match(/-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  // Format sequence with leading zeros (001, 002, etc.)
  const sequenceStr = sequence.toString().padStart(3, '0');

  const reference = `EQ-${categoryCode}-${sequenceStr}`;

  // Double-check uniqueness (in case of race condition)
  const exists = await Equipment.findOne({
    where: { reference },
  });

  if (exists) {
    // If exists, try next sequence
    return generateEquipmentReference(categoryId);
  }

  return reference;
};
