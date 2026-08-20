p = 'src/app/products/[rewardId]/page.tsx'
src = open(p).read()
assert 'import { StartChatButton }' in src, 'import missing'

old = """                  <button
                    type="button"
                    data-share-button
                    data-url={shareUrl}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={17} />
                    Chia sẻ
                  </button>
                </div>
                {/* Trust badges */}"""

new = """                  <button
                    type="button"
                    data-share-button
                    data-url={shareUrl}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-gray-700 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={17} />
                    Chia sẻ
                  </button>
                </div>
                <div className="w-full">
                  <StartChatButton
                    campaignOwnerId={contactUserId || reward.id}
                    campaignOwnerName={campaign?.users?.name || 'Nhà sáng tạo'}
                    campaignId={campaign.id}
                    rewardId={reward.id}
                    rewardTitle={reward.title}
                    rewardPrice={formatVND(reward.minAmount)}
                    variant="outline"
                    className="w-full"
                  />
                </div>
                {/* Trust badges */}"""

n = src.count(old)
print('occurrences:', n)
if n == 1:
    open(p, 'w').write(src.replace(old, new, 1))
    print('done')
