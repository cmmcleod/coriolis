import React from 'react';
import { Modifications } from 'coriolis-data/dist';

/**
 * Generate a tooltip with details of a blueprint's effects
 * @param   {Object}  features    The features of the blueprint
 * @param   {Object}  m           The module to compare with
 * @returns {Object}              The react components
 */
export function blueprintTooltip(translate, features, m)
{
  const results = [];
  for (const feature in features) {
    const featureIsBeneficial = isBeneficial(feature, features[feature]);
    const featureDef = Modifications.modifications[feature];
    if (!featureDef.hidden) {
      let symbol = '';
      if (feature === 'jitter') {
        symbol = '°';
      } else if (featureDef.type === 'percentage') {
        symbol = '%';
      }
      let lowerBound = features[feature][0];
      let upperBound = features[feature][1];
      if (featureDef.type === 'percentage') {
        lowerBound = Math.round(lowerBound * 1000) / 10;
        upperBound = Math.round(upperBound * 1000) / 10;
      }
      const range = `${lowerBound}${symbol} - ${upperBound}${symbol}`;
      if (m) {
        // We have a module - add in the current value
        let current = m.getModValue(feature);
        if (featureDef.type === 'percentage') {
          current = Math.round(current / 10) / 10;
        }
        results.push(<tr key={feature} className={featureIsBeneficial ? 'secondary' : 'warning'}><td style={{ textAlign: 'left' }}>{translate(feature)}</td><td style={{ textAlign: 'right' }}>{lowerBound}{symbol}</td><td style={{ textAlign: 'right' }}>{current}{symbol}</td><td style={{ textAlign: 'right' }}>{upperBound}{symbol}</td></tr>);
      } else {
        // We do not have a module, no value
        results.push(<tr key={feature} className={featureIsBeneficial ? 'secondary' : 'warning'}><td style={{ textAlign: 'left' }}>{translate(feature)}</td><td style={{ textAlign: 'right' }}>{lowerBound}{symbol}</td><td style={{ textAlign: 'right' }}>{upperBound}{symbol}</td></tr>);
      }
    }
  }

  return (
    <table>
      <thead>
       <tr>
         <td>{translate('feature')}</td>
         <td>{translate('worst')}</td>
          {m ? <td>{translate('current')}</td> : null }
         <td>{translate('best')}</td>
       </tr>
      </thead>
      <tbody>
        {results}
      </tbody>
    </table>
  );
}

/**
 * Is this blueprint feature beneficial?
 *
 */
export function isBeneficial(feature, values) {
  const fact = (values[0] < 0 || (values[0] === 0 && values[1] < 0));
  if (Modifications.modifications[feature].higherbetter) {
    return !fact;
  } else {
    return fact;
  }
}
