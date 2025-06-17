import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface FigureProps {
  /**
   * Image source path - will be processed through useBaseUrl
   */
  src: string;
  
  /**
   * Primary caption text for the figure
   */
  caption: string;
  
  /**
   * Alt text for the image (defaults to caption if not provided)
   */
  alt?: string;
  
  /**
   * URL for the expanded view of the image
   */
  expandLink?: string;
  
  /**
   * Text for the expand link
   * @default "[Expand image]"
   */
  expandText?: string;
}

export const Figure: React.FC<FigureProps> = ({
  src,
  caption,
  alt,
  expandLink,
  expandText = "[Expand image]",
}) => {
  const figureId = React.useId();
  const captionId = `fig-caption-${figureId}`;

  // Process URLs unconditionally to avoid conditional hook calls
  const processedSrc = useBaseUrl(src);
  const processedExpandLink = useBaseUrl(expandLink || '');
  
  return (
    <div className={styles.figureWrapper} role="group" aria-labelledby={captionId}>
      <figure className={clsx(
        'figure', 
        'border', 
        'border-gray-400', 
        'p-2',
        'rounded',
        'text--center',
        styles.figure
      )}>
        <img 
          src={processedSrc} 
          alt={alt || caption} 
          className={clsx(
            'img-fluid',
            'rounded',
            styles.figureImage
          )}
        />
        <figcaption 
          id={captionId} 
          className={clsx(
            'figure-caption',
            styles.figureCaption
          )}
        >
          {caption}
          {expandLink && (
            <div className={styles.figureExpandLink}>
              <a
                href={processedExpandLink}
                className={clsx(
                  'linkImage',
                  styles.figureLink
                )}
                aria-label={`Expand image - view full size ${alt || caption}`}
              >
                {expandText}
              </a>
            </div>
          )}
        </figcaption>
      </figure>
    </div>
  );
};

export default Figure;