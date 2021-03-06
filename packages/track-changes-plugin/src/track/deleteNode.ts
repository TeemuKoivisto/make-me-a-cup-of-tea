/*!
 * © 2021 Atypon Systems LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Fragment, Node as PMNode } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import { liftTarget } from 'prosemirror-transform'

/**
 * Deletes node but tries to leave its content intact by trying to unwrap it first
 *
 * Incase unwrapping doesn't work deletes the whole node.
 * @param node
 * @param pos
 * @param tr
 * @returns
 */
export function deleteNode(node: PMNode, pos: number, tr: Transaction) {
  const startPos = tr.doc.resolve(pos + 1)
  const range = startPos.blockRange(tr.doc.resolve(startPos.pos - 2 + node.nodeSize))
  const targetDepth = range ? Number(liftTarget(range)) : NaN
  if (range && !Number.isNaN(targetDepth)) {
    return tr.lift(range, targetDepth)
  }
  const resPos = tr.doc.resolve(pos)
  const canMergeToNodeAbove =
    (resPos.parent !== tr.doc || resPos.nodeBefore) && node.firstChild?.isText
  if (canMergeToNodeAbove) {
    return tr.replaceWith(pos - 1, pos + 1, Fragment.empty)
  } else {
    // NOTE: there's an edge case where moving content is not possible but because the immediate
    // child, say some wrapper blockNode, is also deleted the content could be retained. TODO I guess.
    return tr.delete(pos, pos + node.nodeSize)
  }
}
