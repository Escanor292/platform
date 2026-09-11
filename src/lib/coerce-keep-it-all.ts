/** All-or-Nothing được phép khi có hàng. Không còn tự đổi Keep-It-All. */
export async function coerceCampaignToKeepItAll(_campaignId: string): Promise<boolean> {
  return false;
}
