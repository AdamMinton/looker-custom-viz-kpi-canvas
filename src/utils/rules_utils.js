
/**
 * Evaluates a set of rules against a token value and returns the styling override.
 * 
 * @param {Object} token - The data token containing value_raw
 * @param {Array} rules - Array of rule objects
 * @param {Object} defaultStyle - The base style object to extend/override
 * @returns {Object} The final style object
 */
export const evaluateRules = (token, rules, defaultStyle = {}) => {
  if (!token || !rules || rules.length === 0) return defaultStyle;

  // Ensure we have a valid numeric value for comparison
  let value = token.value_raw;
  if (typeof value === 'string') {
    value = value.replace(/,/g, ''); // Remove commas if present
  }
  value = Number(value);

  if (isNaN(value)) return defaultStyle;

  for (const rule of rules) {
    let isMatch = false;

    // Use Number() to ensure we compare numbers, not strings
    const threshold = Number(rule.threshold);
    const thresholdSecondary = Number(rule.threshold_secondary);

    switch (rule.operator) {
      case 'gt':
        isMatch = value > threshold;
        break;
      case 'lt':
        isMatch = value < threshold;
        break;
      case 'gte':
        isMatch = value >= threshold;
        break;
      case 'lte':
        isMatch = value <= threshold;
        break;
      case 'eq':
        isMatch = value === threshold;
        break;
      case 'between':
        isMatch = value >= threshold && value <= thresholdSecondary;
        break;
      default:
        isMatch = false;
    }

    if (isMatch) {
      // First match wins
      if (rule.styleTarget === 'text') {
        return { ...defaultStyle, color: rule.effectValue };
      }
      if (rule.styleTarget === 'background') {
        return { ...defaultStyle, backgroundColor: rule.effectValue };
      }
      if (rule.styleTarget === 'icon') {
        // For icons, we might pass a special property or handle it in the component.
        // But for style object, we return it as metadata or specific prop.
        // Let's assume the component checks for 'icon' specifically, 
        // but if it affects color, we can set that too.
        // Often "Status Indicator" uses the color for the icon.
        return { ...defaultStyle, color: rule.effectValue, icon: rule.effectValue };
      }
    }
  }

  return defaultStyle;
};
