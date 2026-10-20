import { expect, type Page } from '@playwright/test';

export async function advanceDirection(page:Page) {
  const action=page.locator('.navigation-advance');
  await expect(action).toBeEnabled();
  const final=(await action.textContent())?.startsWith('Tôi đã đến');
  const origin=await page.locator('.current-location').textContent();
  await action.click();
  if(final)await expect(page.locator('.arrival-note')).toBeVisible();
  else await expect(page.locator('.current-location')).not.toHaveText(origin!);
  return final;
}

export async function finishDirections(page:Page) {
  await expect(page.locator('.guided-stage')).toBeVisible();
  for(let i=0;i<12;i++)if(await advanceDirection(page))return;
  throw new Error('Navigation did not reach the destination');
}

export async function expectReadableMap(page:Page) {
  const issues=await page.locator('.guided-floor').evaluate(svg=>{
    const bounds=(svg as SVGSVGElement).viewBox.baseVal;
    const boxes=[...svg.querySelectorAll('text')].map(text=>({text:text.textContent,box:text.getBBox()}));
    return boxes.flatMap(({text,box},index)=>{
      const errors:string[]=[];
      if(box.x<bounds.x||box.x+box.width>bounds.x+bounds.width||box.y<bounds.y||box.y+box.height>bounds.y+bounds.height)errors.push(`Outside map: ${text}`);
      for(const other of boxes.slice(index+1))if(box.x<other.box.x+other.box.width&&box.x+box.width>other.box.x&&box.y<other.box.y+other.box.height&&box.y+box.height>other.box.y)errors.push(`Overlap: ${text} / ${other.text}`);
      return errors;
    });
  });
  expect(issues).toEqual([]);
}
